const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  errorEl.classList.add("hidden");

  const formData = new FormData(form);
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password"),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    errorEl.textContent = err.error ?? "Sign in failed.";
    errorEl.classList.remove("hidden");
    return;
  }

  window.location.href = "/";
});