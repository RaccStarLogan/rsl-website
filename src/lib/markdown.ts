import { marked } from "marked";

const PRIMARY_DOMAIN = "raccstarlogan.com";
const BASE_URL = `https://${PRIMARY_DOMAIN}`;

function isLocalOrAllowedDomain(href: string): boolean {
  const value = href.trim();
  if (!value) return true;
  if (value.startsWith("#")) return true;
  if (value.startsWith("/")) return true;
  if (value.startsWith("./") || value.startsWith("../")) return true;
  if (value.startsWith("?")) return true;
  if (value.startsWith("mailto:") || value.startsWith("tel:")) return true;

  let url: URL;
  try {
    url = new URL(value, BASE_URL);
  } catch {
    return true;
  }

  if (!["http:", "https:"].includes(url.protocol)) return true;
  const host = url.hostname.toLowerCase();
  return host === PRIMARY_DOMAIN || host.endsWith(`.${PRIMARY_DOMAIN}`);
}

function enforceExternalLinks(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (tag, attrs: string) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "";
    if (!href || isLocalOrAllowedDomain(href)) return tag;

    let nextAttrs = attrs;

    if (/\btarget\s*=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\btarget\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i, 'target="_blank"');
    } else {
      nextAttrs = `${nextAttrs} target="_blank"`;
    }

    if (/\brel\s*=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\brel\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i, (_match, _full, dq, sq, bare) => {
        const relValue = (dq ?? sq ?? bare ?? "").trim();
        const tokens = relValue ? relValue.split(/\s+/) : [];
        if (!tokens.includes("noopener")) tokens.push("noopener");
        if (!tokens.includes("noreferrer")) tokens.push("noreferrer");
        return `rel="${tokens.join(" ")}"`;
      });
    } else {
      nextAttrs = `${nextAttrs} rel="noopener noreferrer"`;
    }

    return `<a${nextAttrs}>`;
  });
}

export function renderMarkdown(markdown: string): string {
  return enforceExternalLinks(marked.parse(markdown) as string);
}

export function renderMarkdownInline(markdown: string): string {
  return enforceExternalLinks(marked.parseInline(markdown) as string);
}
