const relationshipIconModules = import.meta.glob("../../assets/wiki-icons/*.svg", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const relationshipIconBySlug = new Map<string, string>();

for (const [path, iconUrl] of Object.entries(relationshipIconModules)) {
  const match = path.match(/\/([^/]+)\.svg$/);
  if (!match) continue;
  relationshipIconBySlug.set(match[1], iconUrl);
}

export function getWikiRelationshipIcon(slug: string): string | null {
  return relationshipIconBySlug.get(slug) ?? null;
}

function normalizeColorToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function toColorClass(prefix: "fill" | "stroke", color: string): string {
  return `wiki-icon-${prefix}-${normalizeColorToken(color).replace(/[^a-z0-9_-]+/g, "-")}`;
}

function appendClassName(tag: string, className: string): string {
  if (new RegExp(`\\b${className}\\b`).test(tag)) return tag;
  if (/\sclass=(['"])([\s\S]*?)\1/i.test(tag)) {
    return tag.replace(/\sclass=(['"])([\s\S]*?)\1/i, (_match, quote: string, classes: string) => {
      const next = classes.trim() ? `${classes} ${className}` : className;
      return ` class=${quote}${next}${quote}`;
    });
  }
  return tag.replace(/^<([a-zA-Z][\w:-]*)/, `<$1 class="${className}"`);
}

function annotateColor(tag: string, kind: "fill" | "stroke", rawValue: string): string {
  const value = normalizeColorToken(rawValue);
  if (!value || value === "none") return tag;
  let next = tag;
  if (!new RegExp(`\\sdata-${kind}=`, "i").test(next)) {
    next = next.replace(/^<([a-zA-Z][\w:-]*)/, `<$1 data-${kind}="${value}"`);
  }
  return appendClassName(next, toColorClass(kind, value));
}

function annotateTagColors(tag: string): string {
  let next = tag;
  const styleMatch = next.match(/\sstyle=(['"])([\s\S]*?)\1/i);
  if (styleMatch) {
    const styleValue = styleMatch[2];
    for (const match of styleValue.matchAll(/(?:^|;)\s*(fill|stroke)\s*:\s*([^;]+)/gi)) {
      const kind = match[1].toLowerCase() as "fill" | "stroke";
      const value = match[2];
      next = annotateColor(next, kind, value);
    }
  }
  for (const match of next.matchAll(/\s(fill|stroke)\s*=\s*(['"])(.*?)\2/gi)) {
    const kind = match[1].toLowerCase() as "fill" | "stroke";
    const value = match[3];
    next = annotateColor(next, kind, value);
  }
  return next;
}

export function styleableRelationshipInlineSvg(svgMarkup: string): string {
  const source = String(svgMarkup ?? "").trim();
  if (!source) return "";
  const withoutXmlDecl = source.replace(/^<\?xml[\s\S]*?\?>\s*/i, "");
  return withoutXmlDecl.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?>/g, (tag) => annotateTagColors(tag));
}
