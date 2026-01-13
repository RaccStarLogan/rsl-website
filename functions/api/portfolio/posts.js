export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ ok: false, error: "Missing D1 binding DB in this environment" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const url = new URL(request.url);

  const scope = url.searchParams.get("scope");   // optional
  const medium = url.searchParams.get("medium"); // optional
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "24", 10), 100);

  // Build a simple query with optional filters
  let sql = `
    SELECT id, scope, medium, y, m, d, n, title, r2_key_thumb, created_at
    FROM posts
  `;
  const params = [];
  const where = [];

  if (scope) { where.push("scope = ?"); params.push(scope); }
  if (medium) { where.push("medium = ?"); params.push(medium); }

  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY created_at DESC LIMIT ?";

  params.push(limit);

  const { results } = await env.DB.prepare(sql).bind(...params).all();

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
