import type { APIRoute } from "astro";
import { getGalleryFilters, listPortfolioItems } from "../../../lib/portfolio/repository";
import type { ItemQueryOptions, PortfolioSort } from "../../../lib/portfolio/types";

const ALLOWED_SORTS: PortfolioSort[] = ["newest", "oldest", "az", "za"];

function getSingleParam(url: URL, key: string): string | null {
  const value = url.searchParams.get(key);
  return value ? value.trim() : null;
}

function parseTags(url: URL): string[] {
  const tags = url.searchParams
    .getAll("tag")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(tags));
}

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const kind = getSingleParam(url, "kind");
  const visibility = getSingleParam(url, "visibility") === "nsfw" ? "nsfw" : "sfw";

  if (kind !== "art" && kind !== "music" && kind !== "project") {
    return new Response(
      JSON.stringify({ error: "kind must be one of art, music, or project" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const personalParam = getSingleParam(url, "personal");
  const commissionParam = getSingleParam(url, "commission");
  const sortParam = getSingleParam(url, "sort");

  const options: ItemQueryOptions = {
    kind,
    visibility,
    sort: ALLOWED_SORTS.includes(sortParam as PortfolioSort)
      ? (sortParam as PortfolioSort)
      : "newest",
    personal:
      personalParam === "only" || personalParam === "exclude" ? personalParam : "all",
    commission:
      commissionParam === "only" || commissionParam === "exclude"
        ? commissionParam
        : "all",
    commissionType: getSingleParam(url, "commissionType"),
    tags: parseTags(url)
  };

  const [items, filters] = await Promise.all([
    listPortfolioItems(options, locals),
    kind === "project" ? Promise.resolve({ commissionTypes: [], tags: [] }) : getGalleryFilters(kind, visibility, locals)
  ]);

  return new Response(JSON.stringify({ items, filters }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
