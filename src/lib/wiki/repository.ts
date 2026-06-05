import { getPortfolioDB } from "../portfolio/d1";
import { defaultWikiEntries } from "./defaultData";
import type {
  WikiContentFormat,
  WikiEntryDetail,
  WikiEntrySummary,
  WikiInfoImage,
  WikiInfoLink,
  WikiInfoRow,
  WikiInfoSong,
  WikiQueryOptions,
  WikiQuote,
  WikiRelationship,
  WikiSection,
  WikiSort,
  WikiTriviaItem,
  WikiTheme
} from "./types";

type WikiEntryRow = {
  id: string;
  slug: string;
  label: string;
  relation_icon_svg: string | null;
  summary: string;
  intro: string;
  entry_type: string;
  tags_json: string;
  visibility: "sfw" | "nsfw" | "both" | "none";
  sort_order: number;
  published_at: string;
  updated_at: string | null;
};

type WikiInfoImageRow = {
  id: string;
  image_url: string;
  image_alt: string;
  tab_label: string | null;
  caption: string | null;
  nsfw_only: number;
  sort_order: number;
};

type WikiInfoSongRow = {
  audio_url: string;
  stream_url: string | null;
  stream_label: string | null;
};

type WikiInfoRowRow = {
  id: string;
  row_key: string;
  row_label: string;
  row_value: string;
  row_format: WikiContentFormat;
  nsfw_only: number;
  sort_order: number;
};

type WikiInfoLinkRow = {
  id: string;
  label: string;
  url: string;
  is_download: number;
  nsfw_only: number;
  sort_order: number;
};

type WikiQuoteRow = {
  quote_text: string;
  audio_url: string | null;
  attribution: string | null;
  voice_credit: string | null;
  nsfw_only: number;
};

type WikiSectionRow = {
  id: string;
  section_key: string;
  section_title: string;
  section_body: string;
  section_format: WikiContentFormat;
  nsfw_only: number;
  sort_order: number;
};

type WikiTriviaRow = {
  id: string;
  item_text: string;
  nsfw_only: number;
  sort_order: number;
};

type WikiRelationshipRow = {
  id: string;
  related_entry_id: string;
  related_slug: string;
  related_label: string;
  related_icon_svg: string | null;
  relation_label: string;
  notes: string | null;
  sort_order: number;
};

type WikiThemeRow = {
  primary_clr: string | null;
  secondary_clr: string | null;
  accent_clr: string | null;
  primary_txt: string | null;
  secondary_txt: string | null;
  accent_txt: string | null;
  primary_bg: string | null;
  secondary_bg: string | null;
  tertiary_bg: string | null;
  hover_bg: string | null;
  warning_clr: string | null;
  tab_clr: string | null;
  tab_hover: string | null;
  tab_active: string | null;
  font: string | null;
  font_url: string | null;
  body_clr: string | null;
  links: string | null;
  custom_css: string | null;
};

const DEFAULT_THEME: WikiTheme = {
  primaryClr: "#8db9ff",
  secondaryClr: "#c0e0ff",
  accentClr: "#a8d6ff",
  primaryTxt: "#c0e0ff",
  secondaryTxt: "#9ed2ff",
  accentTxt: "#a8d6ff",
  primaryBg: "rgba(28, 34, 64, 0.6)",
  secondaryBg: "rgba(44, 60, 100, 0.7)",
  tertiaryBg: "rgba(20, 30, 55, 0.4)",
  hoverBg: "rgba(42, 75, 146, 0.4)",
  warningClr: "#f4b367",
  tabClr: "#A4203C",
  tabHover: "#BE284B",
  tabActive: "#0080FF",
  font: "\"Lexend\", sans-serif",
  fontUrl: null,
  bodyClr: "#1c2240",
  links: "var(--wiki-primary-color)",
  customCss: null
};

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function normalizeSort(sort: WikiSort | undefined): WikiSort {
  return sort ?? "az";
}

function getSortClause(sort: WikiSort): string {
  switch (sort) {
    case "za":
      return "label COLLATE NOCASE DESC";
    case "newest":
      return "published_at DESC, id DESC";
    case "oldest":
      return "published_at ASC, id ASC";
    case "az":
    default:
      return "label COLLATE NOCASE ASC";
  }
}

function toSummary(row: WikiEntryRow): WikiEntrySummary {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    relationIconSvg: row.relation_icon_svg,
    summary: row.summary,
    entryType: row.entry_type,
    tags: parseTags(row.tags_json),
    visibility: row.visibility,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    updatedAt: row.updated_at
  };
}

function toInfoImage(row: WikiInfoImageRow): WikiInfoImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    tabLabel: row.tab_label,
    caption: row.caption,
    nsfwOnly: Boolean(row.nsfw_only),
    sortOrder: row.sort_order
  };
}

function toInfoRow(row: WikiInfoRowRow): WikiInfoRow {
  return {
    id: row.id,
    rowKey: row.row_key,
    rowLabel: row.row_label,
    rowValue: row.row_value,
    rowFormat: row.row_format,
    nsfwOnly: Boolean(row.nsfw_only),
    sortOrder: row.sort_order
  };
}

function toInfoLink(row: WikiInfoLinkRow): WikiInfoLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    isDownload: Boolean(row.is_download),
    nsfwOnly: Boolean(row.nsfw_only),
    sortOrder: row.sort_order
  };
}

function toQuote(row: WikiQuoteRow): WikiQuote {
  return {
    quoteText: row.quote_text,
    audioUrl: row.audio_url,
    attribution: row.attribution,
    voiceCredit: row.voice_credit,
    nsfwOnly: Boolean(row.nsfw_only)
  };
}

function toSection(row: WikiSectionRow): WikiSection {
  return {
    id: row.id,
    sectionKey: row.section_key,
    sectionTitle: row.section_title,
    sectionBody: row.section_body,
    sectionFormat: row.section_format,
    nsfwOnly: Boolean(row.nsfw_only),
    sortOrder: row.sort_order
  };
}

function toTriviaItem(row: WikiTriviaRow): WikiTriviaItem {
  return {
    id: row.id,
    itemText: row.item_text,
    nsfwOnly: Boolean(row.nsfw_only),
    sortOrder: row.sort_order
  };
}

function renderInlineNsfwBlocks(content: string, visibility: "sfw" | "nsfw"): string {
  const source = String(content ?? "");
  if (!source) return source;
  const pattern = /\[\[NSFW\]\]([\s\S]*?)\[\[\/NSFW\]\]/gi;
  return visibility === "nsfw" ? source.replace(pattern, "$1") : source.replace(pattern, "");
}

function includesVisibleBlock(nsfwOnly: boolean, visibility: "sfw" | "nsfw"): boolean {
  return visibility === "nsfw" || !nsfwOnly;
}

async function getAllRows<T>(
  db: NonNullable<ReturnType<typeof getPortfolioDB>>,
  entryId: string,
  primarySql: string,
  fallbackSql?: string
): Promise<T[]> {
  try {
    const result = await db.prepare(primarySql).bind(entryId).all<T>();
    return result.results ?? [];
  } catch {
    if (!fallbackSql) return [];
    try {
      const result = await db.prepare(fallbackSql).bind(entryId).all<T>();
      return result.results ?? [];
    } catch {
      return [];
    }
  }
}

async function getFirstRow<T>(
  db: NonNullable<ReturnType<typeof getPortfolioDB>>,
  entryId: string,
  primarySql: string,
  fallbackSql?: string
): Promise<T | null> {
  try {
    return (await db.prepare(primarySql).bind(entryId).first<T>()) ?? null;
  } catch {
    if (!fallbackSql) return null;
    try {
      return (await db.prepare(fallbackSql).bind(entryId).first<T>()) ?? null;
    } catch {
      return null;
    }
  }
}

function toRelationship(row: WikiRelationshipRow): WikiRelationship {
  return {
    id: row.id,
    relatedEntryId: row.related_entry_id,
    relatedSlug: row.related_slug,
    relatedLabel: row.related_label,
    relatedIconSvg: row.related_icon_svg,
    relationLabel: row.relation_label,
    notes: row.notes,
    sortOrder: row.sort_order
  };
}

function toTheme(row: WikiThemeRow | null): WikiTheme {
  if (!row) return DEFAULT_THEME;
  return {
    primaryClr: row.primary_clr,
    secondaryClr: row.secondary_clr,
    accentClr: row.accent_clr,
    primaryTxt: row.primary_txt,
    secondaryTxt: row.secondary_txt,
    accentTxt: row.accent_txt,
    primaryBg: row.primary_bg,
    secondaryBg: row.secondary_bg,
    tertiaryBg: row.tertiary_bg,
    hoverBg: row.hover_bg,
    warningClr: row.warning_clr,
    tabClr: row.tab_clr,
    tabHover: row.tab_hover,
    tabActive: row.tab_active,
    font: row.font,
    fontUrl: row.font_url,
    bodyClr: row.body_clr,
    links: row.links,
    customCss: row.custom_css
  };
}

function matchesVisibility(
  entryVisibility: "sfw" | "nsfw" | "both" | "none",
  visibility: "sfw" | "nsfw",
  nsfwBothOnly = false
): boolean {
  if (entryVisibility === "none") return false;
  if (visibility === "nsfw" && nsfwBothOnly) return entryVisibility === "both";
  return entryVisibility === "both" || entryVisibility === visibility;
}

function matchesDirectSlugVisibility(
  entryVisibility: "sfw" | "nsfw" | "both" | "none",
  visibility: "sfw" | "nsfw",
  nsfwBothOnly = false
): boolean {
  if (entryVisibility === "none") return true;
  return matchesVisibility(entryVisibility, visibility, nsfwBothOnly);
}

function applyInMemoryFilters(options: WikiQueryOptions): WikiEntrySummary[] {
  const normalizedSearch = options.search?.trim().toLowerCase() ?? "";
  const normalizedType = options.type?.trim().toLowerCase() ?? "";
  const normalizedTags = options.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];
  const normalizedSort = normalizeSort(options.sort);

  const filtered = defaultWikiEntries.filter((entry) => {
    if (!matchesVisibility(entry.visibility, options.visibility, Boolean(options.nsfwBothOnly))) return false;
    if (normalizedType && entry.entryType.trim().toLowerCase() !== normalizedType) return false;

    if (normalizedTags.length > 0) {
      const entryTags = entry.tags.map((tag) => tag.toLowerCase());
      if (!normalizedTags.every((tag) => entryTags.includes(tag))) return false;
    }

    if (normalizedSearch) {
      const haystack = `${entry.label} ${entry.summary} ${entry.entryType} ${entry.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) return false;
    }
    return true;
  });

  const summaries = filtered.map((entry) => ({
    id: entry.id,
    slug: entry.slug,
    label: entry.label,
    summary: entry.summary,
    entryType: entry.entryType,
    tags: entry.tags,
    visibility: entry.visibility,
    sortOrder: entry.sortOrder,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt
  }));

  switch (normalizedSort) {
    case "za":
      summaries.sort((a, b) => b.label.localeCompare(a.label));
      break;
    case "newest":
      summaries.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
      break;
    case "oldest":
      summaries.sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt));
      break;
    case "az":
    default:
      summaries.sort((a, b) => a.label.localeCompare(b.label));
      break;
  }

  return summaries;
}

export function getWikiEntryHref(entry: { slug: string }, visibility: "sfw" | "nsfw" = "sfw"): string {
  return visibility === "nsfw" ? `/nsfw/wiki/${entry.slug}` : `/wiki/${entry.slug}`;
}

export async function listWikiEntries(
  options: WikiQueryOptions,
  locals?: unknown
): Promise<WikiEntrySummary[]> {
  const db = getPortfolioDB(locals);
  if (!db) return applyInMemoryFilters(options);

  const normalizedSort = normalizeSort(options.sort);
  const whereParts: string[] = ["visibility <> 'none'"];
  const params: unknown[] = [];

  if (options.visibility === "nsfw" && options.nsfwBothOnly) {
    whereParts.push("visibility = 'both'");
  } else {
    whereParts.push("(visibility = ? OR visibility = 'both')");
    params.push(options.visibility);
  }

  if (options.type && options.type.trim()) {
    whereParts.push("LOWER(entry_type) = ?");
    params.push(options.type.trim().toLowerCase());
  }

  if (options.tags && options.tags.length > 0) {
    for (const tag of options.tags.map((value) => value.trim().toLowerCase()).filter(Boolean)) {
      whereParts.push("LOWER(tags_json) LIKE ?");
      params.push(`%\"${tag}\"%`);
    }
  }

  if (options.search && options.search.trim()) {
    whereParts.push("(LOWER(label) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(intro) LIKE ?)");
    const search = `%${options.search.trim().toLowerCase()}%`;
    params.push(search, search, search);
  }

  const sql = `
    SELECT
      id,
      slug,
      label,
      relation_icon_svg,
      summary,
      intro,
      entry_type,
      tags_json,
      visibility,
      sort_order,
      published_at,
      updated_at
    FROM wiki_entries
    WHERE ${whereParts.join(" AND ")}
    ORDER BY ${getSortClause(normalizedSort)}
  `;

  try {
    const result = await db.prepare(sql).bind(...params).all<WikiEntryRow>();
    const rows = result.results ?? [];
    if (rows.length === 0) return applyInMemoryFilters(options);
    return rows.map((row) => ({
      ...toSummary(row),
      summary: renderInlineNsfwBlocks(row.summary, options.visibility)
    }));
  } catch {
    return applyInMemoryFilters(options);
  }
}

export async function getWikiEntryBySlug(
  slug: string,
  visibility: "sfw" | "nsfw",
  nsfwBothOnlyOrLocals?: boolean | unknown,
  maybeLocals?: unknown
): Promise<WikiEntryDetail | null> {
  const nsfwBothOnly = typeof nsfwBothOnlyOrLocals === "boolean" ? nsfwBothOnlyOrLocals : false;
  const locals = typeof nsfwBothOnlyOrLocals === "boolean" ? maybeLocals : nsfwBothOnlyOrLocals;
  const db = getPortfolioDB(locals);
  if (!db) {
    const fallback = defaultWikiEntries.find(
      (entry) => entry.slug === slug && matchesDirectSlugVisibility(entry.visibility, visibility, nsfwBothOnly)
    );
    return fallback ?? null;
  }

  const visibilityClause =
    visibility === "nsfw" && nsfwBothOnly
      ? "visibility = 'both'"
      : "(visibility = ? OR visibility = 'both' OR visibility = 'none')";
  const entrySql = `
    SELECT
      id,
      slug,
      label,
      relation_icon_svg,
      summary,
      intro,
      entry_type,
      tags_json,
      visibility,
      sort_order,
      published_at,
      updated_at
    FROM wiki_entries
    WHERE slug = ?
      AND ${visibilityClause}
    LIMIT 1
  `;

  try {
    const entryStmt = db.prepare(entrySql);
    const row =
      visibility === "nsfw" && nsfwBothOnly
        ? await entryStmt.bind(slug).first<WikiEntryRow>()
        : await entryStmt.bind(slug, visibility).first<WikiEntryRow>();
    if (!row) {
      const fallback = defaultWikiEntries.find(
        (entry) => entry.slug === slug && matchesDirectSlugVisibility(entry.visibility, visibility, nsfwBothOnly)
      );
      return fallback ?? null;
    }

    const [imageRows, songRow, infoRowsRaw, infoLinksRaw, quoteRow, sectionRows, triviaRows, relationshipRows, themeRow] =
      await Promise.all([
        getAllRows<WikiInfoImageRow>(
          db,
          row.id,
          "SELECT id, image_url, image_alt, tab_label, caption, nsfw_only, sort_order FROM wiki_info_images WHERE entry_id = ? ORDER BY sort_order ASC, id ASC",
          "SELECT id, image_url, image_alt, tab_label, caption, 0 AS nsfw_only, sort_order FROM wiki_info_images WHERE entry_id = ? ORDER BY sort_order ASC, id ASC"
        ),
        getFirstRow<WikiInfoSongRow>(
          db,
          row.id,
          "SELECT audio_url, stream_url, stream_label FROM wiki_info_song WHERE entry_id = ? LIMIT 1"
        ),
        getAllRows<WikiInfoRowRow>(
          db,
          row.id,
          "SELECT id, row_key, row_label, row_value, row_format, nsfw_only, sort_order FROM wiki_info_rows WHERE entry_id = ? ORDER BY sort_order ASC, id ASC",
          "SELECT id, row_key, row_label, row_value, row_format, 0 AS nsfw_only, sort_order FROM wiki_info_rows WHERE entry_id = ? ORDER BY sort_order ASC, id ASC"
        ),
        getAllRows<WikiInfoLinkRow>(
          db,
          row.id,
          "SELECT id, label, url, is_download, nsfw_only, sort_order FROM wiki_info_links WHERE entry_id = ? ORDER BY sort_order ASC, id ASC",
          "SELECT id, label, url, is_download, 0 AS nsfw_only, sort_order FROM wiki_info_links WHERE entry_id = ? ORDER BY sort_order ASC, id ASC"
        ),
        getFirstRow<WikiQuoteRow>(
          db,
          row.id,
          "SELECT quote_text, audio_url, attribution, voice_credit, nsfw_only FROM wiki_quotes WHERE entry_id = ? LIMIT 1",
          "SELECT quote_text, audio_url, attribution, voice_credit, 0 AS nsfw_only FROM wiki_quotes WHERE entry_id = ? LIMIT 1"
        ),
        getAllRows<WikiSectionRow>(
          db,
          row.id,
          "SELECT id, section_key, section_title, section_body, section_format, nsfw_only, sort_order FROM wiki_sections WHERE entry_id = ? ORDER BY sort_order ASC, id ASC",
          "SELECT id, section_key, section_title, section_body, section_format, 0 AS nsfw_only, sort_order FROM wiki_sections WHERE entry_id = ? ORDER BY sort_order ASC, id ASC"
        ),
        getAllRows<WikiTriviaRow>(
          db,
          row.id,
          "SELECT id, item_text, nsfw_only, sort_order FROM wiki_trivia WHERE entry_id = ? ORDER BY sort_order ASC, id ASC"
        ),
        getAllRows<WikiRelationshipRow>(
          db,
          row.id,
          `SELECT
             wr.id,
             wr.related_entry_id,
             we.slug AS related_slug,
             we.label AS related_label,
             we.relation_icon_svg AS related_icon_svg,
             wr.relation_label,
             wr.notes,
             wr.sort_order
           FROM wiki_relationships wr
           JOIN wiki_entries we ON we.id = wr.related_entry_id
           WHERE wr.entry_id = ?
           ORDER BY wr.sort_order ASC, wr.id ASC`
        ),
        getFirstRow<WikiThemeRow>(
          db,
          row.id,
          `SELECT
             primary_clr, secondary_clr, accent_clr,
             primary_txt, secondary_txt, accent_txt,
             primary_bg, secondary_bg, tertiary_bg, hover_bg,
             warning_clr,
             tab_clr, tab_hover, tab_active,
             font, font_url, body_clr, links, custom_css
           FROM wiki_theme
           WHERE entry_id = ?
           LIMIT 1`
        )
      ]);

    const infoImages = imageRows
      .map(toInfoImage)
      .filter((image) => includesVisibleBlock(image.nsfwOnly, visibility))
      .map((image) => ({
        ...image,
        caption: image.caption ? renderInlineNsfwBlocks(image.caption, visibility) : image.caption
      }));
    const infoRows = infoRowsRaw
      .map(toInfoRow)
      .filter((infoRow) => includesVisibleBlock(infoRow.nsfwOnly, visibility))
      .map((infoRow) => ({
        ...infoRow,
        rowValue: renderInlineNsfwBlocks(infoRow.rowValue, visibility)
      }));
    const infoLinks = infoLinksRaw
      .map(toInfoLink)
      .filter((link) => includesVisibleBlock(link.nsfwOnly, visibility));
    const quote = quoteRow?.quote_text ? toQuote(quoteRow) : null;
    const visibleQuote =
      quote && includesVisibleBlock(quote.nsfwOnly, visibility)
        ? {
            ...quote,
            quoteText: renderInlineNsfwBlocks(quote.quoteText, visibility),
            attribution: quote.attribution ? renderInlineNsfwBlocks(quote.attribution, visibility) : quote.attribution,
            voiceCredit: quote.voiceCredit ? renderInlineNsfwBlocks(quote.voiceCredit, visibility) : quote.voiceCredit
          }
        : null;
    const sections = sectionRows
      .map(toSection)
      .filter((section) => includesVisibleBlock(section.nsfwOnly, visibility))
      .map((section) => ({
        ...section,
        sectionBody: renderInlineNsfwBlocks(section.sectionBody, visibility)
      }));
    const triviaItems = triviaRows
      .map(toTriviaItem)
      .filter((item) => includesVisibleBlock(item.nsfwOnly, visibility))
      .map((item) => ({
        ...item,
        itemText: renderInlineNsfwBlocks(item.itemText, visibility)
      }));
    const relationships = relationshipRows.map(toRelationship).map((relationship) => ({
      ...relationship,
      notes: relationship.notes ? renderInlineNsfwBlocks(relationship.notes, visibility) : relationship.notes
    }));

    return {
      ...toSummary(row),
      summary: renderInlineNsfwBlocks(row.summary, visibility),
      intro: renderInlineNsfwBlocks(row.intro, visibility),
      infoImages,
      infoSong: songRow?.audio_url ? { audioUrl: songRow.audio_url, streamUrl: songRow.stream_url, streamLabel: songRow.stream_label } : null,
      infoRows,
      infoLinks,
      quote: visibleQuote,
      sections,
      triviaItems,
      relationships,
      theme: toTheme(themeRow ?? null)
    };
  } catch {
    const fallback = defaultWikiEntries.find(
      (entry) => entry.slug === slug && matchesDirectSlugVisibility(entry.visibility, visibility, nsfwBothOnly)
    );
    return fallback ?? null;
  }
}
