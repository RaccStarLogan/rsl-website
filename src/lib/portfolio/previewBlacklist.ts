import blacklistText from "../../data/commission-preview-blacklist.txt?raw";
import type { PortfolioItem } from "./types";

const blacklistedPreviewTags = blacklistText
  .split(/\r?\n/)
  .map((tag) => tag.trim().toLowerCase())
  .filter(Boolean);

export function isBlacklistedPreviewItem(item: PortfolioItem): boolean {
  return item.tags.some((tag) => blacklistedPreviewTags.includes(tag.trim().toLowerCase()));
}
