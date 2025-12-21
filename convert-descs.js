import fs from "fs";
import path from "path";
import TurndownService from "turndown";

const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-"
});

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full);
        } else if (entry.name === "desc.md") {
            const html = fs.readFileSync(full, "utf8");

            // Skip already-converted markdown
            if (!html.includes("<")) {
                console.log("Skipping (already markdown):", full);
                continue;
            }

            const md = td.turndown(html);
            fs.writeFileSync(full, md.trim() + "\n", "utf8");
            console.log("Converted:", full);
        }
    }
}

walk(process.cwd());
