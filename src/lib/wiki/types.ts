export type WikiVisibility = "sfw" | "nsfw" | "both" | "none";

export type WikiSort = "az" | "za" | "newest" | "oldest";

export type WikiContentFormat = "text" | "markdown" | "html";

export interface WikiEntrySummary {
  id: string;
  slug: string;
  label: string;
  relationIconSvg: string | null;
  summary: string;
  entryType: string;
  tags: string[];
  visibility: WikiVisibility;
  sortOrder: number;
  publishedAt: string;
  updatedAt: string | null;
}

export interface WikiInfoImage {
  id: string;
  imageUrl: string;
  imageAlt: string;
  tabLabel: string | null;
  caption: string | null;
  nsfwOnly: boolean;
  sortOrder: number;
}

export interface WikiInfoSong {
  audioUrl: string;
  streamUrl: string | null;
  streamLabel: string | null;
}

export interface WikiInfoRow {
  id: string;
  rowKey: string;
  rowLabel: string;
  rowValue: string;
  rowFormat: WikiContentFormat;
  nsfwOnly: boolean;
  sortOrder: number;
}

export interface WikiInfoLink {
  id: string;
  label: string;
  url: string;
  isDownload: boolean;
  nsfwOnly: boolean;
  sortOrder: number;
}

export interface WikiQuote {
  quoteText: string;
  audioUrl: string | null;
  attribution: string | null;
  voiceCredit: string | null;
  nsfwOnly: boolean;
}

export interface WikiSection {
  id: string;
  sectionKey: string;
  sectionTitle: string;
  sectionBody: string;
  sectionFormat: WikiContentFormat;
  nsfwOnly: boolean;
  sortOrder: number;
}

export interface WikiTriviaItem {
  id: string;
  itemText: string;
  nsfwOnly: boolean;
  sortOrder: number;
}

export interface WikiRelationship {
  id: string;
  relatedEntryId: string;
  relatedSlug: string;
  relatedLabel: string;
  relatedIconSvg: string | null;
  relationLabel: string;
  notes: string | null;
  sortOrder: number;
}

export interface WikiTheme {
  primaryClr: string | null;
  secondaryClr: string | null;
  accentClr: string | null;
  primaryTxt: string | null;
  secondaryTxt: string | null;
  accentTxt: string | null;
  primaryBg: string | null;
  secondaryBg: string | null;
  tertiaryBg: string | null;
  hoverBg: string | null;
  warningClr: string | null;
  tabClr: string | null;
  tabHover: string | null;
  tabActive: string | null;
  font: string | null;
  fontUrl: string | null;
  bodyClr: string | null;
  links: string | null;
  customCss: string | null;
}

export interface WikiEntryDetail extends WikiEntrySummary {
  intro: string;
  infoImages: WikiInfoImage[];
  infoSong: WikiInfoSong | null;
  infoRows: WikiInfoRow[];
  infoLinks: WikiInfoLink[];
  quote: WikiQuote | null;
  sections: WikiSection[];
  triviaItems: WikiTriviaItem[];
  relationships: WikiRelationship[];
  theme: WikiTheme;
}

export interface WikiQueryOptions {
  visibility: "sfw" | "nsfw";
  nsfwBothOnly?: boolean;
  type?: string | null;
  tags?: string[];
  search?: string | null;
  sort?: WikiSort;
}
