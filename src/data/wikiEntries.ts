export type WikiEntry = {
  slug: string;
  href: string;
  label: string;
  stylesheet: string;
  meta: {
    type: string;
    tags: string[];
  };
};

export const wikiEntries: WikiEntry[] = [
  {
    slug: "logan-foster",
    href: "/wiki/logan-foster",
    label: "Logan Foster",
    stylesheet: "/wiki/styles/logan-foster.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "jesper-foster",
    href: "/wiki/jesper-foster",
    label: "Jesper Foster",
    stylesheet: "/wiki/styles/jesper-foster.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "jason-skank",
    href: "/wiki/jason-skank",
    label: "Jason Skank",
    stylesheet: "/wiki/styles/jason-skank.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "zeke-harborne",
    href: "/wiki/zeke-harborne",
    label: "Zeke Harborne",
    stylesheet: "/wiki/styles/zeke-harborne.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "azrian-harborne",
    href: "/wiki/azrian-harborne",
    label: "Azrian Harborne",
    stylesheet: "/wiki/styles/azrian-harborne.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "xor-wulff",
    href: "/wiki/xor-wulff",
    label: "Xor Wulff",
    stylesheet: "/wiki/styles/xor-wulff.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "wyvern-embers",
    href: "/wiki/wyvern-embers",
    label: "Wyvern Embers",
    stylesheet: "/wiki/styles/wyvern-embers.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "judas-umbra",
    href: "/wiki/judas-umbra",
    label: "Judas Umbra",
    stylesheet: "/wiki/styles/judas-umbra.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "kevin-foster",
    href: "/wiki/kevin-foster",
    label: "Kevin Foster",
    stylesheet: "/wiki/styles/kevin-foster.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "emily-reeves",
    href: "/wiki/emily-reeves",
    label: "Emily Reeves",
    stylesheet: "/wiki/styles/emily-reeves.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "zelda-voss",
    href: "/wiki/zelda-voss",
    label: "Zelda Voss",
    stylesheet: "/wiki/styles/zelda-voss.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "tony-foster",
    href: "/wiki/tony-foster",
    label: "Tony Foster",
    stylesheet: "/wiki/styles/tony-foster.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "vincent-skank",
    href: "/wiki/vincent-skank",
    label: "Vincent Skank",
    stylesheet: "/wiki/styles/vincent-skank.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "alison-cross",
    href: "/wiki/alison-cross",
    label: "Alison Cross",
    stylesheet: "/wiki/styles/alison-cross.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "marcel-heathcliff",
    href: "/wiki/marcel-heathcliff",
    label: "Marcel Heathcliff",
    stylesheet: "/wiki/styles/marcel-heathcliff.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "finn-calloay",
    href: "/wiki/finn-calloay",
    label: "Finn Calloay",
    stylesheet: "/wiki/styles/finn-calloway.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "greta-voss",
    href: "/wiki/greta-voss",
    label: "Greta Voss",
    stylesheet: "/wiki/styles/greta-voss.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "tycho-draven",
    href: "/wiki/tycho-draven",
    label: "Tycho Draven",
    stylesheet: "/wiki/styles/tycho-draven.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "marx-armstrong",
    href: "/wiki/marx-armstrong",
    label: "Marx Armstrong",
    stylesheet: "/wiki/styles/marx-armstrong.css",
    meta: { type: "Character", tags: ["character"] }
  },
  {
    slug: "landon-gutz",
    href: "/wiki/landon-gutz",
    label: "Landon Gutz",
    stylesheet: "/wiki/styles/landon-gutz.css",
    meta: { type: "Character", tags: ["character"] }
  }
];

export function getWikiEntry(slug: string): WikiEntry {
  const entry = wikiEntries.find((item) => item.slug === slug);

  if (!entry) {
    throw new Error(`Missing wiki entry for slug: ${slug}`);
  }

  return entry;
}