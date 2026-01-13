export async function onRequestGet({ env }) {
  const info = {
    hasDB: !!env.DB,
    hasR2: !!env.RSL_PORTFOLIO,
  };

  if (!env.DB) {
    return new Response(JSON.stringify({ ok: false, where: "env", info }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    const row = await env.DB.prepare("SELECT 1 AS one").first();
    return new Response(JSON.stringify({ ok: true, info, row }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(JSON.stringify({
      ok: false,
      where: "db",
      info,
      error: String(e?.message || e),
    }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}
