/* terminal.js
 *
 * The homepage's interactive terminal. Flow: a short boot log streams
 * in, the side chrome fades in alongside it, then the banner and a
 * pinned prompt appear. You type a command and the output gets
 * appended to the scrollback below the input, the input itself never
 * moves. */
(function terminal() {
  const root = document.getElementById("terminal");
  if (!root) return;

  /* arch.ascii (hyfetch format) is fetched once at startup for `hyfetch`. */
  let archLines = null;
  function loadArt() {
    fetch("/arch.ascii").then(function (r) { return r.ok ? r.text() : ""; }).then(function (t) {
      if (!t) return;
      var lines = t.replace(/\r/g, "").split("\n");
      if (lines[0] && lines[0].trim().charAt(0) === "{") lines.shift();
      lines = lines.map(function (l) { return l.replace(/\$\{c\d\}/g, ""); });
      while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
      archLines = lines;
    }).catch(function () { });
  }

  /* ---- ascii banner ---- */
  const BANNER = [
    " ██████╗██╗      ██████╗ ██╗   ██╗███████╗",
    "██╔════╝██║     ██╔═══██╗██║   ██║██╔════╝",
    "██║     ██║     ██║   ██║██║   ██║█████╗  ",
    "██║     ██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ",
    "╚██████╗███████╗╚██████╔╝ ╚████╔╝ ███████╗",
    " ╚═════╝╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝"
  ].join("\n");

  /* ---- boot log ---- */
  const BOOT = [
    ["info", "starting clovesh..."],
    ["info", "mounting /dev/estrogen..."],
    ["ok", "estrogen levels nominal"],
    ["info", "loading kernel modules (catppuccin)..."],
    ["ok", "modules loaded"],
    ["info", "summoning cats..."],
    ["ok", "oneko ready"],
    ["info", "connecting to discord via restful..."],
    ["ok", "presence online"],
    ["info", "mounting button wall..."],
    ["ok", "88x31 buttons hung"],
    ["info", "starting terminal..."],
    ["ok", "ready, type 'help'"]
  ];

  /* ---- build DOM ---- */
  root.innerHTML =
    '<pre class="t-boot" id="t-boot" aria-hidden="true"></pre>' +
    '<div class="t-main" id="t-main" hidden>' +
    '<pre class="t-banner">' + esc(BANNER) + "</pre>" +
    '<div class="t-greet">Type <b>help</b> for commands.</div>' +
    '<div class="t-inputline">' +
    '<span class="t-prompt">arch@arch<span class="t-path">:[~]$</span></span>' +
    '<input class="t-input" id="t-input" type="text" aria-label="Terminal command input" autocomplete="off" autocapitalize="off" spellcheck="false">' +
    "</div>" +
    '<div class="t-output" id="t-output"></div>' +
    "</div>";

  const bootEl = root.querySelector("#t-boot");
  const mainEl = root.querySelector("#t-main");
  const input = root.querySelector("#t-input");
  const output = root.querySelector("#t-output");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function stamp() {
    return new Date().toLocaleTimeString("en-GB", { hour12: false });
  }

  /* ---- command handlers ---- */
  const COMMANDS = {
    help() {
      const rows = [
        ["help", "show this list"],
        ["code", "Shows the website source code"],
        ["system", "open my system website (append a person's name to open their page)"],
        ["about", "a little about me"],
        ["hyfetch", "system info, with flair"]
      ];
      let out = "Available commands:\n";
      out += rows.map((r) => "  " + r[0].padEnd(12) + r[1]).join("\n");
      return { text: out };
    },
    ls() { return COMMANDS.help(); },
    code() {
      window.open("https://codeberg.org/clove/web/src/branch/main/personal", "_blank");
      return { text: "Opening site source code..." }
    },
    async system(args) {
      const who = (args[0] || "").toLowerCase();
      if (!who) {
        window.open("https://doughmination.uk/", "_blank");
        return { text: "Opening system site..." };
      }
      try {
        const response = await fetch(
          `https://doughmination.uk/v2/plural/member/${encodeURIComponent(who)}`
        );
        if (response.status === 200) {
          window.open(`https://doughmination.uk/${encodeURIComponent(who)}`, "_blank");
          return { text: `Opening ${who}'s profile...` };
        }
        if (response.status === 404) {
          return { text: "That person doesn't exist." };
        }
        if (response.status === 502) {
          return { text: "The server is currently having issues." };
        }
        return { text: `Unexpected response (${response.status}).` };
      } catch (error) {
        return { text: "Failed to contact the server." };
      }
    },
    about() {
      return {
        text:
          "Clove Twilight, fae/faer\n" +
          "Transfem developer from Southampton, UK. I make Projects,\n" +
          "personal-site nonsense, and run a small corner of the internet\n" +
          "under the trade mark 'doughmination system'. Big on Linux, Catppuccin, and cats."
      };
    },
    whoami() {
      return {
        text:
          "Clove Twilight, fae/faer\n" +
          "Transfem developer from Southampton, UK. I make Projects,\n" +
          "personal-site nonsense, and run a small corner of the internet\n" +
          "under the trade mark 'doughmination system'. Big on Linux, Catppuccin, and cats."
      };
    },
    hyfetch() {
      const info = [
        '<b class="t-accent">arch</b>@<b class="t-accent">arch</b>',
        "-----------------------",
        "OS........ Arch Linux x86_64",
        "GPU....... AMD ATI SPEEDSTER MERC 310 RX 7900 XTX",
        "CPU....... AMD Ryzen 9 9950X3D (8) @ 5.7GHz",
        "Host...... B850M AORUS ELITE WIFI6E ICE -CF-WCP-ADO",
        "Kernel.... 7.0.11-arch1-1",
        "Shell..... bash 5.3.12",
        "Theme..... Breeze-Dark [GTK2/3]",
        "Pronouns.. fae/faer",
        "Uptime.... " + uptime(),
      ].join("\n");

      if (!archLines || !archLines.length) {
        return { html: '<pre class="hf-info">' + info + "</pre>" };
      }
      const colors = ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"];
      const n = archLines.length;
      const logo = archLines.map(function (ln, i) {
        const c = colors[Math.min(colors.length - 1, Math.floor((i / n) * colors.length))];
        return '<span style="color:' + c + '">' + esc(ln) + "</span>";
      }).join("\n");
      return {
        html: '<div class="hf"><pre class="hf-logo">' + logo + "</pre>" +
          '<pre class="hf-info">' + info + "</pre></div>"
      };
    },
  };

  /* ---- runtime ---- */
  const startedAt = Date.now();
  function uptime() {
    let s = Math.floor((Date.now() - startedAt) / 1000);
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    const parts = [];
    if (h) parts.push(h + "h");
    if (m) parts.push(m + "m");
    parts.push(s + "s");
    return parts.join(" ");
  }

  const history = [];
  let histIdx = -1;

  function showResult(result) {
    output.innerHTML = "";
    if (!result) return;
    const box = document.createElement("div");
    box.className = "t-result";
    if (result.error) box.classList.add("is-error");
    if (result.html != null) box.innerHTML = result.html;
    else if (result.text != null) box.textContent = result.text;
    output.appendChild(box);
    output.scrollTop = 0;
  }

  function runCommand(fn, args) {
    let r;
    try { r = fn(args); }
    catch (e) { showResult({ text: "error running that command.", error: true }); return; }
    if (r && typeof r.then === "function") {
      r.then(showResult).catch(function () { showResult({ text: "something went wrong.", error: true }); });
    } else {
      showResult(r);
    }
  }

  function run(raw) {
    const cmd = raw.trim();
    output.innerHTML = "";
    if (!cmd) return;
    history.push(cmd); histIdx = history.length;

    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();

    if (COMMANDS[name]) { runCommand(COMMANDS[name], parts.slice(1)); return; }

    showResult({ text: "clovesh: command not found: " + name + "\nType 'help' for a list.", error: true });
  }

  /* ---- tab-complete + history ---- */
  const COMPLETIONS = Object.keys(COMMANDS);
  function complete(prefix) {
    if (!prefix) return null;
    const hits = COMPLETIONS.filter((c) => c.indexOf(prefix) === 0);
    if (hits.length === 1) return hits[0];
    return null;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ""; moveCaretEnd(); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx] || ""; }
      else { histIdx = history.length; input.value = ""; }
      moveCaretEnd();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const c = complete(input.value.trim().toLowerCase());
      if (c) input.value = c;
    }
  });

  function moveCaretEnd() {
    requestAnimationFrame(() => { input.selectionStart = input.selectionEnd = input.value.length; });
  }

  root.addEventListener("click", () => {
    if ((window.getSelection() + "") === "") input.focus();
  });

  /* ---- boot then reveal ---- */
  document.body.classList.add("term-booting");

  let booted = false;
  function finishBoot() {
    if (booted) return;
    booted = true;
    bootEl.hidden = true;
    mainEl.hidden = false;
    document.body.classList.remove("term-booting");
    document.body.classList.add("term-ready");
    input.focus();
  }

  function streamBoot(i) {
    if (booted) return;
    if (i >= BOOT.length) { setTimeout(finishBoot, 350); return; }
    const [kind, msg] = BOOT[i];
    const tag = kind === "ok"
      ? '<span class="b-ok">  OK  </span>'
      : '<span class="b-info"> INFO </span>';
    bootEl.insertAdjacentHTML("beforeend",
      '<span class="b-line">[<span class="b-time">' + stamp() + "</span>] [" + tag + "] " + esc(msg) + "</span>\n");
    bootEl.scrollTop = bootEl.scrollHeight;
    setTimeout(() => streamBoot(i + 1), 120 + Math.random() * 120);
  }

  function skipHandler(e) {
    if (e.type === "keydown" || e.type === "click") finishBoot();
  }
  document.addEventListener("keydown", skipHandler, { once: false });

  loadArt();
  requestAnimationFrame(() => document.body.classList.add("term-chrome-in"));
  streamBoot(0);
})();