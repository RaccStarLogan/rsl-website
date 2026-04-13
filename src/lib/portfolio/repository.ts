import { defaultPortfolioItems, defaultProjectSections } from "./defaultData";
import { getPortfolioDB } from "./d1";
import type {
  GalleryFilters,
  ItemQueryOptions,
  PortfolioItem,
  PortfolioSort,
  ProjectDetail,
  ProjectSection
} from "./types";

type Row = {
  id: string;
  kind: "art" | "music" | "project";
  visibility: "sfw" | "nsfw" | "both";
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail_url: string;
  logo_url: string | null;
  media_url: string | null;
  external_url: string | null;
  commission_type: string | null;
  is_commission: number;
  is_personal: number;
  tags_json: string;
  published_at: string;
};

type ProjectSectionRow = {
  id: number;
  item_id: string;
  heading: string;
  body: string;
  sort_order: number;
};

function toItem(row: Row): PortfolioItem {
  return {
    id: row.id,
    kind: row.kind,
    visibility: row.visibility,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    logoUrl: row.logo_url,
    mediaUrl: row.media_url,
    externalUrl: row.external_url,
    commissionType: row.commission_type,
    isCommission: Boolean(row.is_commission),
    isPersonal: Boolean(row.is_personal),
    tags: parseTags(row.tags_json),
    publishedAt: row.published_at
  };
}

function parseTags(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function getSortClause(sort: PortfolioSort = "newest"): string {
  switch (sort) {
    case "oldest":
      return "published_at ASC, id ASC";
    case "az":
      return "title COLLATE NOCASE ASC";
    case "za":
      return "title COLLATE NOCASE DESC";
    case "newest":
    default:
      return "published_at DESC, id DESC";
  }
}

function sortInMemory(items: PortfolioItem[], sort: PortfolioSort = "newest"): PortfolioItem[] {
  const cloned = [...items];

  switch (sort) {
    case "oldest":
      cloned.sort((a, b) => {
        const d = +new Date(a.publishedAt) - +new Date(b.publishedAt);
        return d !== 0 ? d : a.id.localeCompare(b.id);
      });
      return cloned;
    case "az":
      cloned.sort((a, b) => a.title.localeCompare(b.title));
      return cloned;
    case "za":
      cloned.sort((a, b) => b.title.localeCompare(a.title));
      return cloned;
    case "newest":
    default:
      cloned.sort((a, b) => {
        const d = +new Date(b.publishedAt) - +new Date(a.publishedAt);
        return d !== 0 ? d : b.id.localeCompare(a.id);
      });
      return cloned;
  }
}

function applyInMemoryFilters(items: PortfolioItem[], options: ItemQueryOptions): PortfolioItem[] {
  const normalizedTags = options.tags?.map((tag) => tag.toLowerCase()) ?? [];

  const filtered = items.filter((item) => {
    if (item.kind !== options.kind) {
      return false;
    }

    if (item.visibility !== "both" && item.visibility !== options.visibility) {
      return false;
    }

    if (options.personal === "only" && !item.isPersonal) {
      return false;
    }

    if (options.personal === "exclude" && item.isPersonal) {
      return false;
    }

    if (options.commission === "only" && !item.isCommission) {
      return false;
    }

    if (options.commission === "exclude" && item.isCommission) {
      return false;
    }

    if (options.commissionType && item.commissionType !== options.commissionType) {
      return false;
    }

    if (normalizedTags.length > 0) {
      const itemTags = item.tags.map((tag) => tag.toLowerCase());
      if (!normalizedTags.every((tag) => itemTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });

  return sortInMemory(filtered, options.sort);
}

export async function listPortfolioItems(
  options: ItemQueryOptions,
  locals?: unknown
): Promise<PortfolioItem[]> {
  const db = getPortfolioDB(locals);

  if (!db) {
    return applyInMemoryFilters(defaultPortfolioItems, options);
  }

  const whereParts: string[] = ["kind = ?", "(visibility = ? OR visibility = 'both')"];
  const params: unknown[] = [options.kind, options.visibility];

  if (options.personal === "only") {
    whereParts.push("is_personal = 1");
  }

  if (options.personal === "exclude") {
    whereParts.push("is_personal = 0");
  }

  if (options.commission === "only") {
    whereParts.push("is_commission = 1");
  }

  if (options.commission === "exclude") {
    whereParts.push("is_commission = 0");
  }

  if (options.commissionType) {
    whereParts.push("commission_type = ?");
    params.push(options.commissionType);
  }

  if (options.tags && options.tags.length > 0) {
    for (const tag of options.tags) {
      whereParts.push("LOWER(tags_json) LIKE ?");
      params.push(`%\"${tag.toLowerCase()}\"%`);
    }
  }

  const sql = `
    SELECT
      id,
      kind,
      visibility,
      title,
      slug,
      summary,
      description,
      thumbnail_url,
      logo_url,
      media_url,
      external_url,
      commission_type,
      is_commission,
      is_personal,
      tags_json,
      published_at
    FROM portfolio_items
    WHERE ${whereParts.join(" AND ")}
    ORDER BY ${getSortClause(options.sort)}
  `;

  const query = db.prepare(sql).bind(...params);
  const result = await query.all<Row>();
  return (result.results ?? []).map(toItem);
}

export async function getGalleryFilters(
  kind: "art" | "music",
  visibility: "sfw" | "nsfw",
  locals?: unknown
): Promise<GalleryFilters> {
  const db = getPortfolioDB(locals);

  if (!db) {
    const items = applyInMemoryFilters(defaultPortfolioItems, {
      kind,
      visibility,
      sort: "newest",
      personal: "all",
      commission: "all"
    });

    const commissionTypes = Array.from(
      new Set(items.map((item) => item.commissionType).filter((value): value is string => Boolean(value)))
    ).sort((a, b) => a.localeCompare(b));

    const tags = Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) =>
      a.localeCompare(b)
    );

    return { commissionTypes, tags };
  }

  const commissionTypeSql = `
    SELECT DISTINCT commission_type
    FROM portfolio_items
    WHERE kind = ?
      AND commission_type IS NOT NULL
      AND (visibility = ? OR visibility = 'both')
    ORDER BY commission_type COLLATE NOCASE ASC
  `;

  const tagsSql = `
    SELECT tags_json
    FROM portfolio_items
    WHERE kind = ?
      AND (visibility = ? OR visibility = 'both')
  `;

  const [commissionTypeResult, tagsResult] = await Promise.all([
    db.prepare(commissionTypeSql).bind(kind, visibility).all<{ commission_type: string }>(),
    db.prepare(tagsSql).bind(kind, visibility).all<{ tags_json: string }>()
  ]);

  const commissionTypes = (commissionTypeResult.results ?? [])
    .map((row) => row.commission_type)
    .filter((value) => typeof value === "string")
    .sort((a, b) => a.localeCompare(b));

  const tags = Array.from(
    new Set(
      (tagsResult.results ?? [])
        .flatMap((row) => parseTags(row.tags_json))
        .filter((value) => typeof value === "string")
    )
  ).sort((a, b) => a.localeCompare(b));

  return { commissionTypes, tags };
}

export async function listProjectCards(
  visibility: "sfw" | "nsfw",
  locals?: unknown
): Promise<PortfolioItem[]> {
  return listPortfolioItems(
    {
      kind: "project",
      visibility,
      sort: "newest",
      personal: "all",
      commission: "all"
    },
    locals
  );
}

export async function getPortfolioItemDetail(
  kind: "art" | "music",
  slug: string,
  visibility: "sfw" | "nsfw",
  locals?: unknown
): Promise<PortfolioItem | null> {
  const db = getPortfolioDB(locals);

  if (!db) {
    const item = defaultPortfolioItems.find(
      (entry) =>
        entry.kind === kind &&
        entry.slug === slug &&
        (entry.visibility === "both" || entry.visibility === visibility)
    );

    return item ?? null;
  }

  const itemSql = `
    SELECT
      id,
      kind,
      visibility,
      title,
      slug,
      summary,
      description,
      thumbnail_url,
      logo_url,
      media_url,
      external_url,
      commission_type,
      is_commission,
      is_personal,
      tags_json,
      published_at
    FROM portfolio_items
    WHERE kind = ?
      AND slug = ?
      AND (visibility = ? OR visibility = 'both')
    LIMIT 1
  `;

  const itemRow = await db.prepare(itemSql).bind(kind, slug, visibility).first<Row>();
  if (!itemRow) {
    return null;
  }

  return toItem(itemRow);
}

export async function getProjectDetail(
  slug: string,
  visibility: "sfw" | "nsfw",
  locals?: unknown
): Promise<ProjectDetail | null> {
  const db = getPortfolioDB(locals);

  if (!db) {
    const item = defaultPortfolioItems.find(
      (entry) =>
        entry.kind === "project" &&
        entry.slug === slug &&
        (entry.visibility === "both" || entry.visibility === visibility)
    );

    if (!item) {
      return null;
    }

    const sections = defaultProjectSections
      .filter((section) => section.itemId === item.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return { item, sections };
  }

  const itemSql = `
    SELECT
      id,
      kind,
      visibility,
      title,
      slug,
      summary,
      description,
      thumbnail_url,
      logo_url,
      media_url,
      external_url,
      commission_type,
      is_commission,
      is_personal,
      tags_json,
      published_at
    FROM portfolio_items
    WHERE kind = 'project'
      AND slug = ?
      AND (visibility = ? OR visibility = 'both')
    LIMIT 1
  `;

  const itemRow = await db.prepare(itemSql).bind(slug, visibility).first<Row>();
  if (!itemRow) {
    return null;
  }

  const sectionsSql = `
    SELECT id, item_id, heading, body, sort_order
    FROM project_sections
    WHERE item_id = ?
    ORDER BY sort_order ASC, id ASC
  `;

  const sectionResult = await db.prepare(sectionsSql).bind(itemRow.id).all<ProjectSectionRow>();
  const sections: ProjectSection[] = (sectionResult.results ?? []).map((row) => ({
    id: row.id,
    itemId: row.item_id,
    heading: row.heading,
    body: row.body,
    sortOrder: row.sort_order
  }));

  return {
    item: toItem(itemRow),
    sections
  };
}

export interface ItemNavigation {
  item: PortfolioItem;
  newerSlug: string | null;
  olderSlug: string | null;
}

export async function getPortfolioItemWithNav(
  kind: "art" | "music",
  slug: string,
  visibility: "sfw" | "nsfw",
  locals?: unknown
): Promise<ItemNavigation | null> {
  const db = getPortfolioDB(locals);

  if (!db) {
    const all = defaultPortfolioItems
      .filter(
        (entry) =>
          entry.kind === kind &&
          (entry.visibility === "both" || entry.visibility === visibility)
      )
      .sort((a, b) => {
        const d = +new Date(b.publishedAt) - +new Date(a.publishedAt);
        return d !== 0 ? d : b.id.localeCompare(a.id);
      });

    const idx = all.findIndex((entry) => entry.slug === slug);
    if (idx === -1) return null;

    return {
      item: all[idx],
      newerSlug: idx > 0 ? all[idx - 1].slug : null,
      olderSlug: idx < all.length - 1 ? all[idx + 1].slug : null,
    };
  }

  const item = await getPortfolioItemDetail(kind, slug, visibility, locals);
  if (!item) return null;

  const newerSql = `
    SELECT slug FROM portfolio_items
    WHERE kind = ? AND (visibility = ? OR visibility = 'both')
      AND (published_at > ? OR (published_at = ? AND id > ?))
    ORDER BY published_at ASC, id ASC
    LIMIT 1
  `;

  const olderSql = `
    SELECT slug FROM portfolio_items
    WHERE kind = ? AND (visibility = ? OR visibility = 'both')
      AND (published_at < ? OR (published_at = ? AND id < ?))
    ORDER BY published_at DESC, id DESC
    LIMIT 1
  `;

  const [newerRow, olderRow] = await Promise.all([
    db.prepare(newerSql).bind(kind, visibility, item.publishedAt, item.publishedAt, item.id).first<{ slug: string }>(),
    db.prepare(olderSql).bind(kind, visibility, item.publishedAt, item.publishedAt, item.id).first<{ slug: string }>(),
  ]);

  return {
    item,
    newerSlug: newerRow?.slug ?? null,
    olderSlug: olderRow?.slug ?? null,
  };
}
