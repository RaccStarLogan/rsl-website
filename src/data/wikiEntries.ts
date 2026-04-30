export type WikiEntry = {
  // URL-safe identifier used as the primary key for route lookup.
  slug: string;
  // Internal wiki route/path to link to this entry.
  href: string;
  // Human-readable display name shown in UI lists/navigation.
  label: string;
  // Theme stylesheet key/path selected for this entry page.
  stylesheet: string;
  // Optional downloadable/reference bundle for this entry.
  referencePackUrl?: string;
  referencePackLabel?: string;
  meta: {
    // Free-form category (for example: character, location, lore).
    type: string;
    // Keyword tags used for filtering/search/grouping.
    tags: string[];
  };
};

// Single source of truth for wiki route metadata.
export const wikiEntries: WikiEntry[] = [
];

export function getWikiEntry(slug: string): WikiEntry {
  const entry = wikiEntries.find((item) => item.slug === slug);

  if (!entry) {
    // Fail fast so missing content mappings are caught during development/runtime.
    throw new Error(`Missing wiki entry for slug: ${slug}`);
  }

  return entry;
}
