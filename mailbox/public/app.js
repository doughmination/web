const listEl = document.getElementById("list");
const detailEl = document.getElementById("detail");
const composeModal = document.getElementById("composeModal");
const composeForm = document.getElementById("composeForm");
const composeError = document.getElementById("composeError");
const composeTitle = composeForm.querySelector("h2");
const messageLabel = composeForm.html.closest("label");

let emails = [];
let activeId = null;

// The compose modal is reused for "new message", "reply", and "forward".
// This holds whatever async submit logic applies to the current mode.
let currentSubmitHandler = null;

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadEmails() {
  const res = await fetch("/api/emails");
  emails = await res.json();
  renderList();
}

function renderList() {
  if (emails.length === 0) {
    listEl.innerHTML = '<p class="muted">No emails yet.</p>';
    return;
  }

  listEl.innerHTML = emails
    .map(
      (e) => `
      <div class="list-item ${e.id === activeId ? "active" : ""}" data-id="${e.id}">
        <div class="from">${escapeHtml(e.from)}</div>
        <div class="subject">${escapeHtml(e.subject)}</div>
        <div class="time">${fmtTime(e.receivedAt)}</div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll(".list-item").forEach((el) => {
    el.addEventListener("click", () => openEmail(el.dataset.id));
  });
}

async function openEmail(id) {
  activeId = id;
  renderList();

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

function openComposeModal({ title, toValue, subjectValue, subjectReadOnly, showMessage, submitHandler }) {
  composeError.classList.add("hidden");
  composeForm.reset();
  composeTitle.textContent = title;
  composeForm.to.value = toValue ?? "";
  composeForm.subject.value = subjectValue ?? "";
  composeForm.subject.readOnly = !!subjectReadOnly;
  messageLabel.style.display = showMessage ? "" : "none";
  composeForm.html.required = showMessage;
  currentSubmitHandler = submitHandler;
  composeModal.classList.remove("hidden");
}

function openNewMessage() {
  openComposeModal({
    title: "New message",
    toValue: "",
    subjectValue: "",
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
        }),
      }),
  });
}

function openReply(email) {
  const replyTo = email.direction === "inbound" ? email.from : (email.to || [])[0] ?? "";
  openComposeModal({
    title: "Reply",
    toValue: replyTo,
    subjectValue: /^\s*re\s*:/i.test(email.subject) ? email.subject : `Re: ${email.subject}`,
    subjectReadOnly: false,
    showMessage: true,
    submitHandler: (fields) =>
      fetch(`/api/emails/${email.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: fields.to,
          html: `<p>${escapeHtml(fields.html).replace(/\n/g, "<br>")}</p>`,
        }),
      }),
  });
}

function openForward(email) {
  openComposeModal({
    title: "Forward",
    toValue: "",
    subjectValue: /^\s*fwd?\s*:/i.test(email.subject) ? email.subject : `Fwd: ${email.subject}`,
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

document.getElementById("composeBtn").addEventListener("click", openNewMessage);

document.getElementById("cancelBtn").addEventListener("click", () => {
  composeModal.classList.add("hidden");
});

composeForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!currentSubmitHandler) return;

  const fields = {
    to: composeForm.to.value,
    subject: composeForm.subject.value,
    html: composeForm.html.value,
  };

  const res = await currentSubmitHandler(fields);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    composeError.textContent = err.error ?? "That didn't go through.";
    composeError.classList.remove("hidden");
    return;
  }

  composeModal.classList.add("hidden");
  loadEmails();
  if (activeId) openEmail(activeId);
});

loadEmails();
// Poll for new mail every 15s — simple and good enough for a personal inbox
setInterval(loadEmails, 15000);