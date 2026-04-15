# Build the site, reseed local D1 from SQL files, then run local Wrangler dev.
# Intended for a clean local preview where DB state matches checked-in SQL.
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Building..." -ForegroundColor Cyan
# Run only astro build (skip the Pages patcher which restructures dist/)
npx astro build
if ($LASTEXITCODE -ne 0) { exit 1 }

# Patch generated config for local wrangler dev
$raw = Get-Content dist/server/wrangler.json -Raw
$raw -replace '"pages_build_output_dir":"[^"]*",?' | Set-Content dist/server/wrangler.json -NoNewline

Write-Host "Seeding local D1..." -ForegroundColor Cyan
# Reset tables first so reruns don't hit duplicate key/constraint conflicts.
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --command "DROP TABLE IF EXISTS project_sections; DROP TABLE IF EXISTS portfolio_items; DROP TABLE IF EXISTS commission_pricing;"
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/001_portfolio_schema.sql
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/import-sfw.sql
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/import-nsfw.sql
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/commission-pricing.sql

Write-Host "Starting local server..." -ForegroundColor Cyan
npx wrangler dev --config dist/server/wrangler.json --local
