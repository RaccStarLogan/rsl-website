import type { CommissionPricingTier, PortfolioItem, ProjectSection } from "./types";

// Fallback data used when D1 is unavailable (local/dev safety net).
export const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: "art-001",
    kind: "art",
    visibility: "both",
    title: "Eclipse Runner",
    slug: "eclipse-runner",
    summary: "Character illustration study with neon atmospheric lighting.",
    description:
      "A personal piece focused on dramatic rim-lighting and environment mood.",
    thumbnailUrl: "/default-embed.png",
    logoUrl: null,
    mediaUrl: null,
    externalUrl: null,
    commissionType: null,
    isCommission: false,
    isPersonal: true,
    tags: ["character", "illustration", "lighting"],
    publishedAt: "2026-03-10T00:00:00.000Z"
  },
  {
    id: "art-002",
    kind: "art",
    visibility: "sfw",
    title: "Northpoint Crest Design",
    slug: "northpoint-crest-design",
    summary: "Client heraldic emblem exploration for worldbuilding brand art.",
    description:
      "Commissioned crest package with symbol variants and color pass options.",
    thumbnailUrl: "/default-embed.png",
    logoUrl: null,
    mediaUrl: null,
    externalUrl: null,
    commissionType: "logo",
    isCommission: true,
    isPersonal: false,
    tags: ["commission", "logo", "branding"],
    publishedAt: "2026-02-15T00:00:00.000Z"
  },
  {
    id: "music-001",
    kind: "audio",
    visibility: "both",
    title: "Solar Rail",
    slug: "solar-rail",
    summary: "Synth-heavy instrumental track for high-speed scenes.",
    description:
      "Personal music release balancing cinematic atmosphere and club energy.",
    thumbnailUrl: "/default-embed.png",
    logoUrl: null,
    mediaUrl: null,
    externalUrl: "https://example.com",
    commissionType: null,
    isCommission: false,
    isPersonal: true,
    tags: ["electronic", "instrumental", "synth"],
    publishedAt: "2026-01-08T00:00:00.000Z"
  },
  {
    id: "music-002",
    kind: "audio",
    visibility: "sfw",
    title: "San Bandera Theme Pack",
    slug: "san-bandera-theme-pack",
    summary: "Commissioned score pack with faction stingers and loops.",
    description:
      "Delivered layered stems for intro, combat, and ambient loops.",
    thumbnailUrl: "/default-embed.png",
    logoUrl: null,
    mediaUrl: null,
    externalUrl: "https://example.com",
    commissionType: "soundtrack",
    isCommission: true,
    isPersonal: false,
    tags: ["commission", "soundtrack", "cinematic"],
    publishedAt: "2025-12-01T00:00:00.000Z"
  },
  {
    id: "project-001",
    kind: "project",
    visibility: "both",
    title: "Atlas Narrative Engine",
    slug: "atlas-narrative-engine",
    summary: "A modular story pipeline for cross-media worldbuilding releases.",
    description:
      "Combines lore, characters, and release planning into one production workflow.",
    thumbnailUrl: "/default-embed.png",
    logoUrl: "/default-embed.png",
    mediaUrl: null,
    externalUrl: null,
    commissionType: null,
    isCommission: false,
    isPersonal: true,
    tags: ["tooling", "writing", "pipeline"],
    publishedAt: "2026-03-28T00:00:00.000Z"
  }
];

export const defaultProjectSections: ProjectSection[] = [
  {
    id: 1,
    itemId: "project-001",
    heading: "Overview",
    body:
      "Atlas is a modular production hub for planning arcs, character milestones, and release assets.",
    sortOrder: 0
  },
  {
    id: 2,
    itemId: "project-001",
    heading: "Why It Matters",
    body:
      "It keeps long-running projects organized so ideas can become publishable content faster.",
    sortOrder: 1
  },
  {
    id: 3,
    itemId: "project-001",
    heading: "Current Status",
    body:
      "Core tracking is stable. Next steps are admin tools and tighter media integrations.",
    sortOrder: 2
  }
];

export const defaultCommissionPricing: CommissionPricingTier[] = [
  {
    id: "sketch",
    category: "art",
    label: "Sketch",
    price: "Starting at $30",
    details: "Quick concept or rough illustration with light cleanup.",
    salePrice: null,
    saleLabel: null,
    isActive: true,
    sortOrder: 0
  },
  {
    id: "full-color",
    category: "art",
    label: "Full Color",
    price: "Starting at $80",
    details: "Polished artwork with color, shading, and high-resolution export.",
    salePrice: null,
    saleLabel: null,
    isActive: true,
    sortOrder: 1
  },
  {
    id: "commercial-license",
    category: "art",
    label: "Commercial License",
    price: "Custom Quote",
    details: "Usage rights for merch, branding, or paid distribution projects.",
    salePrice: null,
    saleLabel: null,
    isActive: true,
    sortOrder: 2
  },
  {
    id: "music-composition",
    category: "audio",
    label: "Music Composition",
    price: "Starting at $40 / minute",
    details: "Original instrumental composition with mixing/mastering included.",
    salePrice: null,
    saleLabel: null,
    isActive: true,
    sortOrder: 100
  },
  {
    id: "voice-acting",
    category: "audio",
    label: "Voice Acting",
    price: "Starting at $20 / 100 words",
    details: "Voice-over or character lines. Final quote depends on usage and revisions.",
    salePrice: null,
    saleLabel: null,
    isActive: true,
    sortOrder: 200
  }
];
