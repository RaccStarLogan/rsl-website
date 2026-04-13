# Build, seed local D1, and start wrangler dev
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Seeding local D1..." -ForegroundColor Cyan
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/001_portfolio_schema.sql
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/import-sfw.sql
npx wrangler d1 execute v3_portfolio --local --config dist/server/wrangler.json --file=db/import-nsfw.sql

Write-Host "Starting local server..." -ForegroundColor Cyan
npx wrangler dev --config dist/server/wrangler.json --local
