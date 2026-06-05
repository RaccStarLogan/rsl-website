import type { APIRoute } from "astro";
import { getProjectDetail } from "../../../../lib/portfolio/repository";

export const GET: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing project slug" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const visibility = new URL(request.url).searchParams.get("visibility") === "nsfw" ? "nsfw" : "sfw";
  const project = await getProjectDetail(slug, visibility, locals);

  if (!project) {
    return new Response(JSON.stringify({ error: "Project not found" }), {
      status: 404,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify(project), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
