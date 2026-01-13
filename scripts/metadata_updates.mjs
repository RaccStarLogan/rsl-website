import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const OUT_PUBLIC = "update_metadata_public.sql";
const OUT_NSFW = "update_metadata_nsfw.sql";

// If your ID formats differ, change these two functions.
// Based on your API examples:
//   NSFW-P-A-YYYY-MM-DD(-N optional)
//   NSFW-C-A-YYYY-MM-DD(-N optional)
function makeId({ nsfw, scope, y, m, d, n }) {
  const prefix = nsfw ? "NSFW-" : "";
  const type = scope === "commissions" ? "C-A-" : "P-A-";
  return `${prefix}${type}${y}-${m}-${d}${n ? `-${n}` : ""}`;
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

// SQL string escaping for single quotes + newlines
function sqlString(s) {
  if (s == null) return "NULL";
  const cleaned = String(s)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/'/g, "''");
  return `'${cleaned}'`;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(p) {
  if (!(await fileExists(p))) return null;
  return await fs.readFile(p, "utf8");
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(full);
      out.push(...(await walk(full)));
    }
  }
  return out;
}

// Parses folder paths that end with:
// .../portfolio/(personal|commissions)/YYYY/MM/DD/(N optional)
function parsePostFolder(folderPath) {
  const norm = folderPath.split(path.sep).join("/"); // normalize for regex

  // match either:
  // public/portfolio/<scope>/YYYY/MM/DD
  // public/portfolio/<scope>/YYYY/MM/DD/N
  // public/nsfw/portfolio/<scope>/YYYY/MM/DD
  // public/nsfw/portfolio/<scope>/YYYY/MM/DD/N
  const re =
    /\/public\/(nsfw\/)?portfolio\/(personal|commissions)\/(\d{4})\/(\d{2})\/(\d{2})(?:\/(\d+))?$/;

  const m = norm.match(re);
  if (!m) return null;

  const nsfw = Boolean(m[1]);
  const scope = m[2]; // personal|commissions
  const y = m[3];
  const mo = m[4];
  const d = m[5];
  const n = m[6] ? m[6] : null;

  return { nsfw, scope, y, m: mo, d, n };
}

async function main() {
  const publicRoot = path.join(ROOT, "public");
  const allDirs = await walk(publicRoot);

  const updatesPublic = [];
  const updatesNSFW = [];

  for (const dir of allDirs) {
    const parsed = parsePostFolder(dir);
    if (!parsed) continue;

    const titlePath = path.join(dir, "title.txt");
    const descPath = path.join(dir, "desc.md");

    const [titleRaw, descRaw] = await Promise.all([
      readIfExists(titlePath),
      readIfExists(descPath),
    ]);

    // If neither file exists, skip
    if (titleRaw == null && descRaw == null) continue;

    // Clean title: single line, trim
    const title = titleRaw != null ? titleRaw.trim() : null;
    // Keep desc as-is (markdown), but trim trailing whitespace
    const desc = descRaw != null ? descRaw.trim() : null;

    const id = makeId(parsed);

    // Build UPDATE statement. Only update fields that exist so we don't overwrite.
    const sets = [];
    if (titleRaw != null) sets.push(`title=${sqlString(title)}`);
    if (descRaw != null) sets.push(`desc_md=${sqlString(desc)}`);

    const sql = `UPDATE posts SET ${sets.join(", ")} WHERE id=${sqlString(id)};`;

    if (parsed.nsfw) updatesNSFW.push(sql);
    else updatesPublic.push(sql);
  }

  // Write output files
  await fs.writeFile(OUT_PUBLIC, updatesPublic.join("\n") + "\n", "utf8");
  await fs.writeFile(OUT_NSFW, updatesNSFW.join("\n") + "\n", "utf8");

  console.log(`Wrote ${updatesPublic.length} updates -> ${OUT_PUBLIC}`);
  console.log(`Wrote ${updatesNSFW.length} updates -> ${OUT_NSFW}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
