import type { APIRoute } from "astro";
import { listWikiEntries } from "../../../lib/wiki/repository";
import type { WikiSort } from "../../../lib/wiki/types";

const ALLOWED_SORTS: WikiSort[] = ["az", "za", "newest", "oldest"];

function getSingleParam(url: URL, key: string): string | null {
  const value = url.searchParams.get(key);
  return value ? value.trim() : null;
}

function parseTags(url: URL): string[] {
  return url.searchParams
    .getAll("tag")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const visibility = getSingleParam(url, "visibility") === "nsfw" ? "nsfw" : "sfw";
  const nsfwBothOnly = getSingleParam(url, "nsfwBothOnly") === "1";
  const sortParam = getSingleParam(url, "sort");

  const items = await listWikiEntries(
    {
      visibility,
      nsfwBothOnly,
      type: getSingleParam(url, "type"),
      tags: parseTags(url),
      search: getSingleParam(url, "q"),
      sort: ALLOWED_SORTS.includes(sortParam as WikiSort) ? (sortParam as WikiSort) : "az"
    },
    locals
  );

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
