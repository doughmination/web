const listEl = document.getElementById("list");
const detailEl = document.getElementById("detailContent");
const backBtn = document.getElementById("backBtn");
const layoutEl = document.querySelector(".layout");
const composeModal = document.getElementById("composeModal");
const composeForm = document.getElementById("composeForm");
const composeError = document.getElementById("composeError");
const composeTitle = composeForm.querySelector("h2");
const messageLabel = composeForm.html.closest("label");
const attachmentsInput = composeForm.attachments;
const attachmentListEl = document.getElementById("attachmentList");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const deleteDraftBtn = document.getElementById("deleteDraftBtn");
const folderNav = document.getElementById("folderNav");

let emails = [];
let activeId = null;
let activeFolder = "inbox";

// The compose modal is reused for "new message", "reply", "forward", and
// "edit draft". This holds whatever async submit logic applies right now.
let currentSubmitHandler = null;
// Set only while editing an existing draft, so Save/Delete know what to act on.
let editingDraftId = null;
// Attachments staged for the message currently open in the compose modal.
let stagedAttachments = [];

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // dataURL looks like "data:<type>;base64,<content>" — we only want the payload
      const result = reader.result;
      const comma = result.indexOf(",");
      resolve(comma === -1 ? result : result.slice(comma + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function pathForFolder(folder) {
  return `/${folder}`;
}

function folderForPath(pathname) {
  const clean = pathname.replace(/\/+$/, "");
  if (clean === "/sent") return "sent";
  if (clean === "/drafts") return "drafts";
  return "inbox"; // covers "/" and "/inbox"
}

function setActiveFolderButton(folder) {
  folderNav.querySelectorAll(".folder-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.folder === folder);
  });
}

function goToFolder(folder, { push = true } = {}) {
  setActiveFolderButton(folder);
  activeId = null;
  detailEl.innerHTML = '<p class="muted">Select an email to read it.</p>';
  layoutEl.classList.remove("show-detail");
  if (push) history.pushState(null, "", pathForFolder(folder));
  loadEmails(folder);
}

async function loadEmails(folder = activeFolder) {
  activeFolder = folder;
  const res = await fetch(`/api/emails?folder=${encodeURIComponent(folder)}`);
  emails = await res.json();
  renderList();
}

function renderList() {
  if (emails.length === 0) {
    listEl.innerHTML = '<p class="muted">Nothing here.</p>';
    return;
  }

  listEl.innerHTML = emails
    .map(
      (e) => `
      <div class="list-item ${e.id === activeId ? "active" : ""}" data-id="${e.id}">
        <div class="from">${escapeHtml(activeFolder === "drafts" ? (e.to || []).join(", ") || "(no recipient)" : e.from)}</div>
        <div class="subject">${escapeHtml(e.subject || "(no subject)")}</div>
        <div class="time">${fmtTime(e.receivedAt)}</div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll(".list-item").forEach((el) => {
    el.addEventListener("click", () => {
      if (activeFolder === "drafts") {
        openDraft(el.dataset.id);
      } else {
        openEmail(el.dataset.id);
      }
    });
  });
}

function attachmentsHtml(email) {
  if (!email.attachments || email.attachments.length === 0) return "";
  const items = email.attachments
    .map((a) =>
      a.id
        ? `<li><a href="/api/emails/${email.id}/attachments/${a.id}" download="${escapeHtml(a.filename)}">${escapeHtml(a.filename)}</a> <span class="muted-inline">(${fmtSize(a.size)})</span></li>`
        : `<li>${escapeHtml(a.filename)} <span class="muted-inline">(unavailable)</span></li>`
    )
    .join("");
  return `<ul class="attachment-list">${items}</ul>`;
}

async function openEmail(id) {
  activeId = id;
  renderList();
  layoutEl.classList.add("show-detail");

  const res = await fetch(`/api/emails/${id}/thread`);
  if (!res.ok) {
    detailEl.innerHTML = '<p class="muted">Could not load this email.</p>';
    return;
  }
  const thread = await res.json();
  const last = thread[thread.length - 1];

  const messagesHtml = thread
    .map(
      (email) => `
      <article class="message">
        <div class="msg-head">
          <span class="dir-badge ${email.direction}">${email.direction === "inbound" ? "received" : "sent"}</span>
          <strong>${escapeHtml(email.from)}</strong>
          <span class="muted-inline">to ${escapeHtml((email.to || []).join(", "))}</span>
        </div>
        <div class="meta">${fmtTime(email.receivedAt)}</div>
        <div class="body">
          ${email.html ?? `<pre style="white-space: pre-wrap;">${escapeHtml(email.text ?? "(empty message)")}</pre>`}
        </div>
        ${attachmentsHtml(email)}
      </article>
    `
    )
    .join("");

  detailEl.innerHTML = `
    ${messagesHtml}
    <div class="thread-actions">
      <button class="btn-accent" id="replyBtn">Reply</button>
      <button class="btn-ghost" id="forwardBtn">Forward</button>
    </div>
  `;

  document.getElementById("replyBtn").addEventListener("click", () => openReply(last));
  document.getElementById("forwardBtn").addEventListener("click", () => openForward(last));
}

async function openDraft(id) {
  activeId = id;
  renderList();
  layoutEl.classList.add("show-detail");

  const draft = emails.find((e) => e.id === id);
  if (!draft) return;

  // Draft list items omit html/text (list endpoint strips bodies), so fetch the full record.
  const res = await fetch(`/api/emails/${id}/thread`).catch(() => null);
  // Drafts aren't part of a real thread; fall back to what we already have if this 404s.
  const full = res && res.ok ? (await res.json())[0] : draft;

  editingDraftId = id;
  stagedAttachments = full.attachments ?? [];
  openComposeModal({
    title: "Edit draft",
    toValue: (full.to || []).join(", "),
    subjectValue: full.subject ?? "",
    htmlValue: full.html ?? "",
    subjectReadOnly: false,
    showMessage: true,
    showDeleteDraft: true,
    submitHandler: (fields) => sendDraft(id, fields),
  });
}

function renderAttachmentList() {
  if (stagedAttachments.length === 0) {
    attachmentListEl.innerHTML = "";
    return;
  }
  attachmentListEl.innerHTML = stagedAttachments
    .map((a, i) => `<li>${escapeHtml(a.filename)} <span class="muted-inline">(${fmtSize(a.size ?? a.content?.length ?? 0)})</span> <button type="button" data-idx="${i}" class="btn-ghost remove-attachment">Remove</button></li>`)
    .join("");
  attachmentListEl.querySelectorAll(".remove-attachment").forEach((btn) => {
    btn.addEventListener("click", () => {
      stagedAttachments.splice(Number(btn.dataset.idx), 1);
      renderAttachmentList();
    });
  });
}

attachmentsInput.addEventListener("change", async () => {
  const files = Array.from(attachmentsInput.files ?? []);
  for (const file of files) {
    const content = await fileToBase64(file);
    stagedAttachments.push({
      filename: file.name,
      contentType: file.type,
      content,
      size: file.size,
    });
  }
  attachmentsInput.value = "";
  renderAttachmentList();
});

function openComposeModal({
  title,
  toValue,
  subjectValue,
  htmlValue,
  subjectReadOnly,
  showMessage,
  showDeleteDraft,
  submitHandler,
}) {
  composeError.classList.add("hidden");
  composeForm.reset();
  composeTitle.textContent = title;
  composeForm.to.value = toValue ?? "";
  composeForm.subject.value = subjectValue ?? "";
  composeForm.html.value = htmlValue ?? "";
  composeForm.subject.readOnly = !!subjectReadOnly;
  messageLabel.style.display = showMessage ? "" : "none";
  composeForm.html.required = showMessage;
  deleteDraftBtn.classList.toggle("hidden", !showDeleteDraft);
  currentSubmitHandler = submitHandler;
  if (!showDeleteDraft) editingDraftId = null;
  renderAttachmentList();
  composeModal.classList.remove("hidden");
}

function currentFields() {
  return {
    to: composeForm.to.value,
    subject: composeForm.subject.value,
    html: composeForm.html.value,
    attachments: stagedAttachments,
  };
}

function openNewMessage() {
  editingDraftId = null;
  stagedAttachments = [];
  openComposeModal({
    title: "New message",
    toValue: "",
    subjectValue: "",
    htmlValue: "",
    subjectReadOnly: false,
    showMessage: true,
    submitHandler: (fields) =>
      fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: fields.to,
          subject: fields.subject,
          html: `<p>${escapeHtml(fields.html).replace(/\n/g, "<br>")}</p>`,
          attachments: fields.attachments,
        }),
      }),
  });
}

function openReply(email) {
  const replyTo = email.direction === "inbound" ? email.from : (email.to || [])[0] ?? "";
  editingDraftId = null;
  stagedAttachments = [];
  openComposeModal({
    title: "Reply",
    toValue: replyTo,
    subjectValue: /^\s*re\s*:/i.test(email.subject) ? email.subject : `Re: ${email.subject}`,
    htmlValue: "",
    subjectReadOnly: false,
    showMessage: true,
    submitHandler: (fields) =>
      fetch(`/api/emails/${email.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: fields.to,
          html: `<p>${escapeHtml(fields.html).replace(/\n/g, "<br>")}</p>`,
          attachments: fields.attachments,
        }),
      }),
  });
}

function openForward(email) {
  editingDraftId = null;
  stagedAttachments = [];
  openComposeModal({
    title: "Forward",
    toValue: "",
    subjectValue: /^\s*fwd?\s*:/i.test(email.subject) ? email.subject : `Fwd: ${email.subject}`,
    htmlValue: "",
    subjectReadOnly: true,
    showMessage: false,
    submitHandler: () =>
      fetch(`/api/emails/${email.id}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: composeForm.to.value }),
      }),
  });
}

async function sendDraft(id, fields) {
  // Make sure any edits (including attachments just added) are persisted
  // before asking the server to send — /api/drafts/:id/send uses whatever
  // is already saved, it doesn't take a body.
  await fetch(`/api/drafts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: fields.to,
      subject: fields.subject,
      html: `<p>${escapeHtml(fields.html).replace(/\n/g, "<br>")}</p>`,
      attachments: fields.attachments,
    }),
  });

  return fetch(`/api/drafts/${id}/send`, { method: "POST" });
}

async function saveDraft() {
  const fields = currentFields();
  const payload = JSON.stringify({
    to: fields.to,
    subject: fields.subject,
    html: fields.html,
    attachments: fields.attachments,
  });

  const res = editingDraftId
    ? await fetch(`/api/drafts/${editingDraftId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      })
    : await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

  if (!res.ok) {
    composeError.textContent = "Couldn't save draft.";
    composeError.classList.remove("hidden");
    return;
  }

  composeModal.classList.add("hidden");
  if (activeFolder === "drafts") loadEmails();
}

async function deleteDraftAndClose() {
  if (!editingDraftId) return;
  await fetch(`/api/drafts/${editingDraftId}`, { method: "DELETE" });
  composeModal.classList.add("hidden");
  activeId = null;
  loadEmails();
  layoutEl.classList.remove("show-detail");
  detailEl.innerHTML = '<p class="muted">Select an email to read it.</p>';
}

document.getElementById("composeBtn").addEventListener("click", openNewMessage);

backBtn.addEventListener("click", () => {
  layoutEl.classList.remove("show-detail");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  composeModal.classList.add("hidden");
});

saveDraftBtn.addEventListener("click", saveDraft);
deleteDraftBtn.addEventListener("click", deleteDraftAndClose);

folderNav.querySelectorAll(".folder-item").forEach((btn) => {
  btn.addEventListener("click", () => goToFolder(btn.dataset.folder));
});

window.addEventListener("popstate", () => {
  goToFolder(folderForPath(location.pathname), { push: false });
});

composeForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!currentSubmitHandler) return;

  const fields = currentFields();
  const res = await currentSubmitHandler(fields);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    composeError.textContent = err.error ?? "That didn't go through.";
    composeError.classList.remove("hidden");
    return;
  }

  // Sending a draft removes it from disk server-side; make sure we don't
  // try to resave it as a draft if the modal gets reopened before a reload.
  if (editingDraftId) editingDraftId = null;

  composeModal.classList.add("hidden");
  loadEmails();
  if (activeId && activeFolder !== "drafts") openEmail(activeId);
});

const initialFolder = folderForPath(location.pathname);
setActiveFolderButton(initialFolder);
// Normalize "/" to "/inbox" in the address bar without adding a history entry.
history.replaceState(null, "", pathForFolder(initialFolder));
loadEmails(initialFolder);
// Poll for new mail every 15s — simple and good enough for a personal inbox
setInterval(() => loadEmails(), 15000);