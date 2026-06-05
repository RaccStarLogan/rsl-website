import { wikiEntries } from "../../data/wikiEntries";
import type { WikiEntryDetail, WikiTheme } from "./types";

const DEFAULT_SUMMARY_SUFFIX = "Wiki entry.";
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

export const defaultWikiEntries: WikiEntryDetail[] = wikiEntries.map((entry, index) => ({
  id: `WIKI-DEF-${entry.slug.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`,
  slug: entry.slug,
  label: entry.label,
  relationIconSvg: null,
  summary: `${entry.label} ${DEFAULT_SUMMARY_SUFFIX}`,
  intro: "",
  entryType: entry.meta.type,
  tags: entry.meta.tags,
  visibility: "both",
  infoImages: [],
  infoSong: null,
  infoRows: [],
  infoLinks: entry.referencePackUrl
    ? [
        {
          id: `WIKI-LINK-${entry.slug}`,
          label: entry.referencePackLabel ?? "Download References (.zip)",
          url: entry.referencePackUrl,
          isDownload: true,
          nsfwOnly: false,
          sortOrder: 0
        }
      ]
    : [],
  quote: null,
  sections: [],
  triviaItems: [],
  relationships: [],
  theme: {
    ...DEFAULT_THEME,
    customCss: entry.stylesheet ? `/* Legacy stylesheet reference: ${entry.stylesheet} */` : null
  },
  sortOrder: index,
  publishedAt: "1970-01-01T00:00:00.000Z",
  updatedAt: null
}));
