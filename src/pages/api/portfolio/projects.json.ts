import type { APIRoute } from "astro";
import { listProjectCards } from "../../../lib/portfolio/repository";

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const visibility = url.searchParams.get("visibility") === "nsfw" ? "nsfw" : "sfw";
  const projects = await listProjectCards(visibility, locals);

  return new Response(JSON.stringify({ items: projects }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
