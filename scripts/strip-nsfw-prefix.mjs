import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const NSFW_OUTPUT_DIR = path.join(DIST_DIR, "nsfw");
// Only rewrite file types that are expected to contain URL strings.
const TARGET_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".xml",
  ".txt",
  ".webmanifest"
]);

// Supported URL contexts where "/nsfw" can appear in build output.
const URL_PREFIX_PATTERNS = [
  /(href\s*=\s*["'])\/nsfw\//gi,
  /(href\s*=\s*["'])\/nsfw(?=(["']))/gi,
  /(src\s*=\s*["'])\/nsfw\//gi,
  /(src\s*=\s*["'])\/nsfw(?=(["']))/gi,
  /(content\s*=\s*["'])\/nsfw\//gi,
  /(content\s*=\s*["'])\/nsfw(?=(["']))/gi,
  /(action\s*=\s*["'])\/nsfw\//gi,
  /(action\s*=\s*["'])\/nsfw(?=(["']))/gi,
  /(url\(\s*["']?)\/nsfw\//gi,
  /(url\(\s*["']?)\/nsfw(?=(\s*["']?\)))/gi
];

// Recursive file walker for post-build rewrite pass.
async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }

      return [fullPath];
    })
  );

  return files.flat();
}

async function pathExists(filePath) {
  const pathStats = await stat(filePath).catch(() => null);
  return Boolean(pathStats);
}

async function moveNsfwOutputToRoot() {
  const nsfwExists = await pathExists(NSFW_OUTPUT_DIR);
  if (!nsfwExists) {
    return { movedFiles: 0, conflictFiles: 0, hadNsfwOutput: false };
  }

  const moved = { count: 0, conflicts: 0 };

  async function moveDirContents(fromDir, toDir) {
    await mkdir(toDir, { recursive: true });
    const entries = await readdir(fromDir, { withFileTypes: true });

    for (const entry of entries) {
      const fromPath = path.join(fromDir, entry.name);
      const toPath = path.join(toDir, entry.name);

      if (entry.isDirectory()) {
        await moveDirContents(fromPath, toPath);
        continue;
      }

      if (await pathExists(toPath)) {
        // Keep existing root files unchanged when a name collision occurs.
        moved.conflicts += 1;
        continue;
      }

      await mkdir(path.dirname(toPath), { recursive: true });
      await rename(fromPath, toPath);
      moved.count += 1;
    }
  }

  await moveDirContents(NSFW_OUTPUT_DIR, DIST_DIR);
  if (moved.conflicts === 0) {
    // Only remove the source tree when we completed a full conflict-free move.
    await rm(NSFW_OUTPUT_DIR, { recursive: true, force: true });
  }

  return {
    movedFiles: moved.count,
    conflictFiles: moved.conflicts,
    hadNsfwOutput: true
  };
}

function stripNsfwPrefix(content) {
  // Apply all rewrite patterns so links/assets/forms/css urls are normalized.
  return URL_PREFIX_PATTERNS.reduce((updated, pattern) => {
    return updated.replace(pattern, "$1/");
  }, content);
}

function isTextFile(filePath) {
  return TARGET_EXTENSIONS.has(path.extname(filePath));
}

async function main() {
  const distStats = await stat(DIST_DIR).catch(() => null);
  if (!distStats || !distStats.isDirectory()) {
    console.error(`[strip-nsfw-prefix] Build output not found at ${DIST_DIR}`);
    process.exitCode = 1;
    return;
  }

  const moveResult = await moveNsfwOutputToRoot();
  // Skip rewrites if moves conflicted to avoid partial/ambiguous output states.
  const shouldRewrite = moveResult.conflictFiles === 0 && moveResult.movedFiles > 0;
  const files = shouldRewrite ? await walkFiles(DIST_DIR) : [];
  let changedFiles = 0;

  for (const filePath of files) {
    if (!isTextFile(filePath)) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const updated = stripNsfwPrefix(content);

    if (updated !== content) {
      await writeFile(filePath, updated, "utf8");
      changedFiles += 1;
    }
  }

  if (moveResult.conflictFiles > 0) {
    console.warn(
      `[strip-nsfw-prefix] Skipped ${moveResult.conflictFiles} conflicting file move(s). Keeping /nsfw output and skipping URL rewrite.`
    );
  }

  console.log(
    `[strip-nsfw-prefix] Moved ${moveResult.movedFiles} file(s) from /nsfw output and updated ${changedFiles} file(s).`
  );
}

await main();
