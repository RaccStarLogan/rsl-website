import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths from script location so this works from any cwd.
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "src", "data");
const outputPath = path.join(outputDir, "termsLastUpdated.ts");

// Terms pages we surface "last updated" labels for in the UI.
const termsFiles = {
  sfw: "src/pages/terms.astro",
  nsfw: "src/pages/nsfw/terms/index.astro",
  nsfwAdditional: "src/pages/nsfw/terms/additional.astro",
};

// Allows timezone override in CI/manual runs; defaults to local product timezone.
const localTimeZone = process.env.TERMS_TIME_ZONE || "America/Chicago";

const formatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: localTimeZone,
});

function getLastUpdatedLabel(filePath) {
  try {
    // Use the most recent commit timestamp for this specific file path.
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
    // Missing git metadata (or file history) should not fail the build.
    return null;
  }
}

// Generate a strongly-typed map consumed by frontend pages/components.
const lastUpdated = Object.fromEntries(
  Object.entries(termsFiles).map(([key, filePath]) => [key, getLastUpdatedLabel(filePath)]),
);

const output = `export const termsLastUpdated = ${JSON.stringify(lastUpdated, null, 2)} as const;\n`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, output, "utf8");

console.log(`[terms-last-updated] Wrote ${path.relative(repoRoot, outputPath)}`);
