export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") || "portfolio/personal/";

  const listing = await env.R2_PORTFOLIO.list({ prefix, limit: 10 });

  return new Response(JSON.stringify({
    ok: true,
    prefix,
    keys: listing.objects.map(o => o.key),
    truncated: listing.truncated
  }), { headers: { "content-type": "application/json; charset=utf-8" } });
}
