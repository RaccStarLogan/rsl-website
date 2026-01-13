const MEDIA_BASE = "https://media.raccstarlogan.com/";

function isNSFW() {
    return location.pathname.toLowerCase().includes("/nsfw/");
}
function apiBase() {
    return isNSFW() ? "/api/nsfw/portfolio" : "/api/portfolio";
}

async function setupNavButtons(currentId) {
    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    if (!nextBtn || !prevBtn) return;

    // start hidden (matches your HTML default)
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";

    const res = await fetch(`${apiBase()}/nav_buttons?id=${encodeURIComponent(currentId)}`, {
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) return;

    const data = await res.json();
    if (!data?.ok) return;

    if (data.next) {
        nextBtn.style.display = "";
        nextBtn.onclick = () => {
            location.href = `./view.html?id=${encodeURIComponent(data.next)}`;
        };
    }

    if (data.prev) {
        prevBtn.style.display = "";
        prevBtn.onclick = () => {
            location.href = `./view.html?id=${encodeURIComponent(data.prev)}`;
        };
    }
}

async function loadPost() {
    const titleEl = document.getElementById("title");
    const imgEl = document.getElementById("viewed-image");
    const descEl = document.getElementById("desc");

    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
        if (titleEl) titleEl.textContent = "Missing ?id=";
        return;
    }

    const res = await fetch(`${apiBase()}/post?id=${encodeURIComponent(id)}`, {
        headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
        if (titleEl) titleEl.textContent = `API error: ${res.status}`;
        return;
    }

    const data = await res.json();
    const p = data?.post || data?.result || data?.results?.[0];
    if (!p) {
        if (titleEl) titleEl.textContent = "Post not found.";
        return;
    }

    if (titleEl) titleEl.textContent = p.title || p.id;

    const key = p.r2_key_primary || p.r2_key_thumb;
    if (imgEl && key) {
        imgEl.src = MEDIA_BASE + key;
        imgEl.alt = p.title || p.id;
    }

    const md = p.desc_md || "";
    if (descEl) descEl.innerHTML = window.marked ? marked.parse(md) : md;

    await setupNavButtons(id);
}

loadPost();