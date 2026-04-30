import type { APIRoute } from "astro";
import { getWikiEntryBySlug } from "../../../../lib/wiki/repository";

export const GET: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug?.trim();
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing wiki slug." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const visibility = url.searchParams.get("visibility") === "nsfw" ? "nsfw" : "sfw";
  const nsfwBothOnly = url.searchParams.get("nsfwBothOnly") === "1";
  const item = await getWikiEntryBySlug(slug, visibility, nsfwBothOnly, locals);

  if (!item) {
    return new Response(JSON.stringify({ error: "Wiki entry not found." }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ item }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
