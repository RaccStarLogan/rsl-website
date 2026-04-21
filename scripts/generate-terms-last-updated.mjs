import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "src", "data");
const outputPath = path.join(outputDir, "termsLastUpdated.ts");

const termsFiles = {
  sfw: "src/pages/terms.astro",
  nsfw: "src/pages/nsfw/terms/index.astro",
  nsfwAdditional: "src/pages/nsfw/terms/additional.astro",
};

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function getLastUpdatedLabel(filePath) {
  try {
    const output = execFileSync("git", ["log", "-1", "--format=%cI", "--", filePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (!output) return null;

    const date = new Date(output);
    if (Number.isNaN(date.getTime())) return null;

    return formatter.format(date);
  } catch {
    return null;
  }
}

const lastUpdated = Object.fromEntries(
  Object.entries(termsFiles).map(([key, filePath]) => [key, getLastUpdatedLabel(filePath)]),
);

const output = `export const termsLastUpdated = ${JSON.stringify(lastUpdated, null, 2)} as const;\n`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, output, "utf8");

console.log(`[terms-last-updated] Wrote ${path.relative(repoRoot, outputPath)}`);
