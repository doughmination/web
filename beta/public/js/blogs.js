/* ============================================================
   blog.js — fetches /js/on/posts.json and renders blog cards
   into #blog-cards on /blog.

   Expected posts.json shape (array of objects):
   [
     {
       "slug": "05072026-hello-world",   // DDMMYYYY-blogname, matches /blog/<slug>
       "title": "Hello World",
       "excerpt": "A short one or two line teaser for the post.",
       "thumbnail": "/assets/blog/hello-world.png" // optional
     },
     ...
   ]

   The date shown on each card is parsed straight out of the slug,
   so you never have to keep a separate date field in sync.
   ============================================================ */

(() => {
  const POSTS_URL = "/js/on/posts.json";
  const container = document.getElementById("blog-cards");

  if (!container) return;

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  /**
   * Pulls DDMMYYYY off the front of a slug like "05072026-hello-world"
   * and returns { date, name, timestamp } or null if it doesn't match.
   */
  function parseSlug(slug) {
    const match = /^(\d{2})(\d{2})(\d{4})-(.+)$/.exec(slug);
    if (!match) return null;

    const [, dd, mm, yyyy, name] = match;
    const day = parseInt(dd, 10);
    const month = parseInt(mm, 10); // 1-indexed
    const year = parseInt(yyyy, 10);

    const timestamp = new Date(year, month - 1, day).getTime();

    return { day, month, year, name, timestamp };
  }

  function formatDate({ day, month, year }) {
    const monthName = MONTHS[month - 1] || "";
    return `${day} ${monthName} ${year}`;
  }

  function titleCaseFromSlugName(name) {
    return name
      .split("-")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function renderEmptyState() {
    container.innerHTML = `
      <p class="blog-empty">No posts yet — check back soon!</p>
    `;
  }

  function renderErrorState() {
    container.innerHTML = `
      <p class="blog-empty">Couldn't load posts right now. Try refreshing.</p>
    `;
  }

  function createCard(post) {
    const parsed = parseSlug(post.slug);
    if (!parsed) {
      console.warn(`blog.js: skipping post with invalid slug "${post.slug}"`);
      return null;
    }

    const href = `/blog/${post.slug}`;
    const title = post.title || titleCaseFromSlugName(parsed.name);
    const dateLabel = formatDate(parsed);
    const excerpt = post.excerpt || "";
    const thumbnail = post.thumbnail || "";

    const card = document.createElement("a");
    card.className = "blog-card";
    card.href = href;

    card.innerHTML = `
      ${thumbnail
        ? `<div class="blog-card-thumb">
             <img src="${escapeHTML(thumbnail)}" alt="" loading="lazy">
           </div>`
        : ""
      }
      <div class="blog-card-body">
        <time class="blog-card-date" datetime="${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}">
          ${escapeHTML(dateLabel)}
        </time>
        <h3 class="blog-card-title">${escapeHTML(title)}</h3>
        ${excerpt ? `<p class="blog-card-excerpt">${escapeHTML(excerpt)}</p>` : ""}
      </div>
    `;

    // stash timestamp for sorting
    card.dataset.timestamp = parsed.timestamp;

    return card;
  }

  async function loadPosts() {
    container.setAttribute("aria-busy", "true");
    container.classList.add("is-loading");

    try {
      const res = await fetch(POSTS_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to fetch posts.json: ${res.status}`);

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        renderEmptyState();
        return;
      }

      const cards = posts
        .map(createCard)
        .filter(Boolean)
        .sort((a, b) => b.dataset.timestamp - a.dataset.timestamp); // newest first

      if (cards.length === 0) {
        renderEmptyState();
        return;
      }

      container.innerHTML = "";
      cards.forEach(card => container.appendChild(card));
    } catch (err) {
      console.error("blog.js:", err);
      renderErrorState();
    } finally {
      container.removeAttribute("aria-busy");
      container.classList.remove("is-loading");
    }
  }

  loadPosts();
})();