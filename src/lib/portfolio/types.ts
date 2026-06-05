// `music` remains in the union as a legacy alias while data migrates to `audio`.
export type PortfolioKind = "art" | "audio" | "music" | "project";

export type PortfolioVisibility = "sfw" | "nsfw" | "both";

export type PortfolioSort = "newest" | "oldest" | "az" | "za";

export interface PortfolioItem {
  id: string;
  kind: PortfolioKind;
  visibility: PortfolioVisibility;
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnailUrl: string;
  logoUrl: string | null;
  mediaUrl: string | null;
  externalUrl: string | null;
  commissionType: string | null;
  isCommission: boolean;
  isPersonal: boolean;
  tags: string[];
  publishedAt: string;
}

export interface ProjectSection {
  id: number;
  itemId: string;
  heading: string;
  body: string;
  sortOrder: number;
}

export interface ProjectDetail {
  item: PortfolioItem;
  sections: ProjectSection[];
}

export interface GalleryFilters {
  commissionTypes: string[];
  tags: string[];
}

export interface ItemQueryOptions {
  kind: PortfolioKind;
  visibility: "sfw" | "nsfw";
  sort?: PortfolioSort;
  personal?: "all" | "only" | "exclude";
  commission?: "all" | "only" | "exclude";
  commissionType?: string | null;
  tags?: string[];
}

export interface CommissionPricingTier {
  id: string;
  category: "art" | "audio";
  label: string;
  price: string;
  details: string;
  salePrice: string | null;
  saleLabel: string | null;
  isActive: boolean;
  sortOrder: number;
}
