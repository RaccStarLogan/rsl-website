/**
 * Post-build patcher for Cloudflare Pages deployment (Astro + Cloudflare adapter).
 *
 * Astro's Cloudflare adapter outputs:
 *   - dist/client/  → static assets
 *   - dist/server/  → worker bundle (entry.mjs, chunks, etc.)
 *
 * Cloudflare Pages (Worker mode) expects:
 *   - Static assets at the root of the output dir (pages_build_output_dir)
 *   - A SINGLE file at dist/_worker.js that exports the Worker handler
 *
 * This script restructures dist/ after `astro build`:
 *   1. Copies dist/client/* → dist/          (static assets at root)
 *   2. Creates dist/_worker.js file that re-exports ./server/entry.mjs
 *   3. Removes the .wrangler/deploy/config.json redirect so Pages uses wrangler.toml
 *   4. Cleans up dist/client/ to avoid exposing duplicate assets
 */

import { cp, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const CLIENT = path.join(DIST, "client");
const SERVER = path.join(DIST, "server");
const WORKER_FILE = path.join(DIST, "_worker.js");
const REDIRECT = path.resolve(process.cwd(), ".wrangler/deploy/config.json");

// 1. Copy static assets from dist/client/ → dist/
try {
  const clientItems = await readdir(CLIENT);
  for (const item of clientItems) {
    await cp(path.join(CLIENT, item), path.join(DIST, item), { recursive: true });
  }
  console.log(`[patch] Copied ${clientItems.length} static asset(s) to dist/`);
} catch (err) {
  console.warn(`[patch] Skipped client copy: ${CLIENT} not found or unreadable`, err?.message);
}

// 2. Create _worker.js file that re-exports the Astro entry
// Astro Cloudflare adapter's entry is usually dist/server/entry.mjs
await writeFile(
  WORKER_FILE,
  `export { default } from "./server/entry.mjs";\n`
);
console.log(`[patch] Created ${path.relative(process.cwd(), WORKER_FILE)} re-exporting ./server/entry.mjs`);

// 3. Remove the redirect config so Pages uses wrangler.toml directly
try {
  await rm(REDIRECT);
  console.log(`[patch] Removed .wrangler/deploy/config.json redirect`);
} catch {
  // redirect config may not exist locally
  console.log(`[patch] No .wrangler/deploy/config.json redirect to remove`);
}

// 4. Clean up original client directory to avoid exposing duplicate assets
try {
  await rm(CLIENT, { recursive: true });
  console.log(`[patch] Cleaned up dist/client/`);
} catch {
  console.log(`[patch] No dist/client/ directory to clean up`);
}

console.log(`[patch] Done — dist/ is now Pages-ready for Worker mode`);
