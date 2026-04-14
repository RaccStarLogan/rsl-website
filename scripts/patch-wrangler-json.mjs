/**
 * Post-build patcher for dist/server/wrangler.json
 *
 * The Astro Cloudflare adapter generates a wrangler.json with entries that
 * break Cloudflare Pages deployments:
 *   - "assets" block with binding "ASSETS" conflicts with Pages' auto-provided ASSETS binding
 *   - "triggers: {}" is invalid (expects { crons: [...] } or omitted)
 *   - "kv_namespaces" may contain bindings without an "id" (e.g. SESSION)
 *
 * This script strips those problematic entries after build.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CONFIG_PATH = path.resolve(process.cwd(), "dist/server/wrangler.json");

try {
  const raw = await readFile(CONFIG_PATH, "utf-8");
  const config = JSON.parse(raw);

  // Remove assets block — Pages auto-provides the ASSETS binding;
  // having it explicit causes "The name 'ASSETS' is reserved in Pages projects"
  delete config.assets;

  // Remove empty triggers object
  if (config.triggers && Object.keys(config.triggers).length === 0) {
    delete config.triggers;
  }

  // Remove kv_namespaces entries that have no id (e.g. auto-generated SESSION)
  if (Array.isArray(config.kv_namespaces)) {
    config.kv_namespaces = config.kv_namespaces.filter((ns) => ns.id);
    if (config.kv_namespaces.length === 0) {
      delete config.kv_namespaces;
    }
  }

  await writeFile(CONFIG_PATH, JSON.stringify(config), "utf-8");

  const removed = [];
  if (raw.includes('"assets"')) removed.push("assets");
  if (raw.includes('"triggers"')) removed.push("triggers");
  if (raw.includes('"SESSION"')) removed.push("SESSION kv binding");
  console.log(`[patch-wrangler-json] Cleaned: ${removed.join(", ") || "nothing to patch"}`);
} catch (err) {
  if (err.code === "ENOENT") {
    console.log("[patch-wrangler-json] No dist/server/wrangler.json found, skipping.");
  } else {
    throw err;
  }
}
