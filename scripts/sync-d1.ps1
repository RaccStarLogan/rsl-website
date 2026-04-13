# Sync local SQL files to remote Cloudflare D1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$db = "v3_portfolio"

Write-Host "Dropping and recreating schema..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --command "DROP TABLE IF EXISTS project_sections; DROP TABLE IF EXISTS portfolio_items;"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Applying schema..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --file=db/001_portfolio_schema.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing SFW data..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --file=db/import-sfw.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing NSFW data..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --file=db/import-nsfw.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Verifying..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --command "SELECT count(*) as total FROM portfolio_items"

Write-Host "Done!" -ForegroundColor Green
