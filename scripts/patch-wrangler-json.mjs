/**
 * Post-build patcher for Cloudflare Pages deployment.
 *
 * The Astro Cloudflare adapter outputs a Workers-style config (main + assets)
 * in dist/server/wrangler.json, but our Cloudflare dashboard project is Pages.
 *
 * Pages expects:
 *   - Static assets at the root of the output dir (pages_build_output_dir)
 *   - Worker code in a _worker.js/ directory with an index.js entry
 *   - No "main", "rules", "no_bundle", or explicit "assets" binding in config
 *
 * This script restructures dist/ after the Astro build:
 *   1. Copies dist/client/* → dist/          (static assets at root)
 *   2. Copies dist/server/* → dist/_worker.js/  (worker bundle)
 *   3. Creates dist/_worker.js/index.js shim → re-exports entry.mjs
 *   4. Removes the .wrangler/deploy/config.json redirect so Pages uses wrangler.toml
 *   5. Cleans up dist/client/ and dist/server/ to avoid exposing source
 */

import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const CLIENT = path.join(DIST, "client");
const SERVER = path.join(DIST, "server");
const WORKER = path.join(DIST, "_worker.js");
const REDIRECT = path.resolve(process.cwd(), ".wrangler/deploy/config.json");

// 1. Copy static assets from dist/client/ → dist/
const clientItems = await readdir(CLIENT);
for (const item of clientItems) {
  await cp(path.join(CLIENT, item), path.join(DIST, item), { recursive: true });
}
console.log(`[patch] Copied ${clientItems.length} static asset(s) to dist/`);

// 2. Copy worker from dist/server/ → dist/_worker.js/
await mkdir(WORKER, { recursive: true });
const serverItems = await readdir(SERVER);
for (const item of serverItems) {
  await cp(path.join(SERVER, item), path.join(WORKER, item), { recursive: true });
}
console.log(`[patch] Copied worker to dist/_worker.js/`);

// 3. Create index.js shim that re-exports the Astro entry
await writeFile(
  path.join(WORKER, "index.js"),
  `export { default } from "./entry.mjs";\n`
);
console.log(`[patch] Created dist/_worker.js/index.js`);

// 4. Remove the redirect config so Pages uses wrangler.toml directly
try {
  await rm(REDIRECT);
  console.log(`[patch] Removed .wrangler/deploy/config.json redirect`);
} catch {
  // redirect config may not exist locally
}

// 5. Clean up original directories to avoid exposing source
await rm(CLIENT, { recursive: true });
await rm(SERVER, { recursive: true });
console.log(`[patch] Cleaned up dist/client/ and dist/server/`);

console.log(`[patch] Done — dist/ is now Pages-ready`);
