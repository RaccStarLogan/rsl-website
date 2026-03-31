function isNSFW() {
  return location.pathname.includes("/nsfw/");
}

function apiBase() {
  return isNSFW() ? "/api/nsfw/portfolio" : "/api/portfolio";
}

function scopeFromPath() {
  const p = location.pathname.toLowerCase();

  if (p.includes("/personal/")) return "personal";
  if (p.includes("/commissions/")) return "commissions";

  if (p.includes("personal")) return "personal";
  if (p.includes("commissions")) return "commissions";

  return "commissions";
}

function matchesScope(post, scope) {
  if (!post) return false;
  if (post.scope === scope || post.medium === scope) return true;
  if (!post.id) return false;

  if (scope === "personal") return post.id.includes("P-A-");
  if (scope === "commissions") return post.id.includes("C-A-");

  return false;
}

function formatDate(iso, options = {}) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(d);
}

async function setLastUpdated() {
  const el = document.getElementById("lastUpdated");
  if (!el) return;

  const params = new URLSearchParams(location.search);
  const scopeParam = params.get("scope");
  const mediumParam = params.get("medium");
  const inferred = scopeParam || mediumParam || scopeFromPath();
  const primaryFilter = scopeParam ? { scope: scopeParam } : mediumParam ? { medium: mediumParam } : { scope: inferred };
  const fallbackFilter = (!scopeParam && !mediumParam) ? { medium: inferred } : null;

  async function fetchLatest(filter) {
    const qs = new URLSearchParams();
    if (filter.scope) qs.set("scope", filter.scope);
    if (filter.medium) qs.set("medium", filter.medium);
    qs.set("limit", "1");

    const res = await fetch(`${apiBase()}/posts?${qs.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.results?.[0]?.created_at || null;
  }

  async function fetchLatestFromAll(scope) {
    const qs = new URLSearchParams();
    qs.set("limit", "1000");

    const res = await fetch(`${apiBase()}/posts?${qs.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const posts = Array.isArray(data?.results) ? data.results : [];
    const filtered = posts.filter(p => matchesScope(p, scope));

    if (!filtered.length) return null;

    return filtered.reduce((latest, p) => {
      if (!p.created_at) return latest;
      if (!latest) return p.created_at;
      return p.created_at > latest ? p.created_at : latest;
    }, null);
  }

  try {
    let iso = await fetchLatest(primaryFilter);
    if (!iso && fallbackFilter) {
      iso = await fetchLatest(fallbackFilter);
    }
    if (!iso && fallbackFilter) {
      iso = await fetchLatestFromAll(inferred);
    }

    if (!iso) {
      el.textContent = "Last updated: Never";
      return;
    }

    // Viewer local time
    const local = formatDate(iso);

    // Your fixed timezone (change if needed)
    const creator = formatDate(iso, {
      timeZone: "America/Chicago",
      timeZoneName: "short",
    });

    el.innerHTML = `
      Last updated: ${local}<br>
      <span class="creator-time">Creator time: ${creator}</span>
    `;
  } catch (e) {
    console.error(e);
    el.textContent = "Last updated: Error";
  }
}

setLastUpdated();
