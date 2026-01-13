const MEDIA_BASE = "https://media.raccstarlogan.com/";

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
}

function isNSFW() {
    return location.pathname.toLowerCase().includes("/nsfw/");
}

function apiBase() {
    return isNSFW() ? "/api/nsfw/portfolio" : "/api/portfolio";
}

function scopeFromPath() {
    const p = location.pathname.toLowerCase();

    // Prefer explicit directory segments first
    if (p.includes("/personal/")) return "personal";
    if (p.includes("/commissions/")) return "commissions";

    // If your URLs are like "...personal.html" or "...commissions.html"
    if (p.includes("personal")) return "personal";
    if (p.includes("commissions")) return "commissions";

    // fallback
    return "commissions";
}

function viewUrl() {
    return "./view.html?id=";
}

function getPostYear(post) {
    if (post?.y) return String(post.y);

    if (post?.created_at) {
        const d = new Date(post.created_at);
        if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
    }

    if (post?.id) {
        const m = String(post.id).match(/(\d{4})-\d{2}-\d{2}/);
        if (m) return m[1];
    }

    return "Unknown";
}

function matchesScope(post, scope) {
    if (!post) return false;
    if (post.scope === scope || post.medium === scope) return true;
    if (!post.id) return false;

    if (scope === "personal") return post.id.includes("P-A-");
    if (scope === "commissions") return post.id.includes("C-A-");

    return false;
}

function buildPostsUrl({ scope, medium, limit }) {
    const qs = new URLSearchParams();
    if (scope) qs.set("scope", scope);
    if (medium) qs.set("medium", medium);
    qs.set("limit", String(limit));
    return `${apiBase()}/posts?${qs.toString()}`;
}

async function fetchPosts({ scope, medium, limit }) {
    const url = buildPostsUrl({ scope, medium, limit });

    try {
        const res = await fetch(url, {
            headers: { "Accept": "application/json" }
        });

        const text = await res.text();

        if (!res.ok) {
            return { ok: false, status: res.status, url, text };
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return { ok: false, status: "parse", url, text };
        }

        return { ok: true, posts: data?.results, url };
    } catch (e) {
        return { ok: false, status: "request", url };
    }
}

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const status = document.getElementById("galleryStatus");
    if (!gallery || !status) return;

    status.textContent = "Loading…";

    const params = new URLSearchParams(location.search);

    const scopeParam = params.get("scope");
    const mediumParam = params.get("medium");
    const inferred = scopeParam || mediumParam || scopeFromPath();

    const primaryFilter = scopeParam ? { scope: scopeParam } : mediumParam ? { medium: mediumParam } : { scope: inferred };
    const fallbackFilter = (!scopeParam && !mediumParam) ? { medium: inferred } : null;

    const primary = await fetchPosts({ ...primaryFilter, limit: 1000 });
    if (!primary.ok) {
        status.textContent = "API error: request failed";
        console.error("URL:", primary.url);
        console.error("Status:", primary.status);
        if (primary.text) console.error("Response:", primary.text.slice(0, 500));
        return;
    }

    let posts = Array.isArray(primary.posts) ? primary.posts : [];

    if (posts.length === 0 && fallbackFilter) {
        const fallback = await fetchPosts({ ...fallbackFilter, limit: 1000 });
        if (fallback.ok && Array.isArray(fallback.posts) && fallback.posts.length) {
            posts = fallback.posts;
        }
    }

    if (posts.length === 0 && fallbackFilter) {
        const unfiltered = await fetchPosts({ limit: 1000 });
        if (unfiltered.ok && Array.isArray(unfiltered.posts) && unfiltered.posts.length) {
            posts = unfiltered.posts.filter(p => matchesScope(p, inferred));
            if (posts.length === 0) {
                console.warn("No posts matched inferred scope; check scope/medium values.", inferred);
            }
        }
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        status.textContent = "No posts found.";
        gallery.innerHTML = "";
        return;
    }

    const grouped = new Map();
    for (const post of posts) {
        const year = getPostYear(post);
        if (!grouped.has(year)) grouped.set(year, []);
        grouped.get(year).push(post);
    }

    const chunks = [];
    for (const [year, yearPosts] of grouped.entries()) {
        chunks.push(`<h2>${esc(year)}</h2>`);
        chunks.push(`<div class="gallery-grid">`);

        for (const p of yearPosts) {
            const key = p.r2_key_thumb || p.r2_key_primary || "";
            const thumb = key ? (MEDIA_BASE + key) : "";
            const title = esc(p.title || p.id);
            const href = viewUrl() + encodeURIComponent(p.id);

            chunks.push(`
        <div class="gallery-item">
          <a href="${href}">
            <img loading="lazy" src="${thumb}" alt="${title}">
            <div class="label">${title}</div>
          </a>
        </div>
      `);
        }

        chunks.push(`</div>`);
    }

    gallery.innerHTML = chunks.join("");

    status.textContent = "";
}

loadGallery();
