export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Use the correct binding name for THIS route:
  // SFW route should use env.DB (or whatever you bound)
  // NSFW route should use env.DB_NSFW (or whatever you bound)
  const DB = env.DB;

  // Get current post bucket + timestamp
  const cur = await DB.prepare(
    "SELECT id, scope, medium, created_at FROM posts WHERE id = ? LIMIT 1"
  ).bind(id).first();

  if (!cur) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Previous: older than current
  const prev = await DB.prepare(`
    SELECT id FROM posts
    WHERE scope = ? AND medium = ?
      AND (created_at < ? OR (created_at = ? AND id < ?))
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `).bind(cur.scope, cur.medium, cur.created_at, cur.created_at, cur.id).first();

  // Next: newer than current
  const next = await DB.prepare(`
    SELECT id FROM posts
    WHERE scope = ? AND medium = ?
      AND (created_at > ? OR (created_at = ? AND id > ?))
    ORDER BY created_at ASC, id ASC
    LIMIT 1
  `).bind(cur.scope, cur.medium, cur.created_at, cur.created_at, cur.id).first();

  return new Response(JSON.stringify({
    ok: true,
    prev: prev?.id ?? null,
    next: next?.id ?? null
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
