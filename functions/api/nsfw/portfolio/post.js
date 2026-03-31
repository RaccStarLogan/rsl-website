export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: "Missing ?id=" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const row = await env.NSFW_DB
    .prepare(`SELECT * FROM posts WHERE id = ?`)
    .bind(id)
    .first();

  if (!row) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // Fetch tags too (optional but nice)
  const { results: tagRows } = await env.NSFW_DB
    .prepare(`
      SELECT tag_name
      FROM post_tags
      WHERE post_id = ?
      ORDER BY tag_name ASC
    `)
    .bind(id)
    .all();

  const tags = tagRows.map(t => t.tag_name);

  return new Response(JSON.stringify({ ok: true, post: row, tags }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
