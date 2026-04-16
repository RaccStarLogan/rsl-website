# Push checked-in SQL state to remote D1.
# This is a destructive sync (drops/recreates tables before import).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$db = "v3_portfolio"

Write-Host "Dropping and recreating schema..." -ForegroundColor Cyan
# Keep drop order aligned with FK dependencies.
npx wrangler d1 execute $db --remote --yes --command "DROP TABLE IF EXISTS project_sections; DROP TABLE IF EXISTS portfolio_items; DROP TABLE IF EXISTS commission_pricing;"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Applying schema..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --yes --file=db/001_portfolio_schema.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing SFW data..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --yes --file=db/import-sfw.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing NSFW data..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --yes --file=db/import-nsfw.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing commission pricing..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --yes --file=db/commission-pricing.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Verifying..." -ForegroundColor Cyan
npx wrangler d1 execute $db --remote --yes --command "SELECT count(*) as total FROM portfolio_items"

Write-Host "Done!" -ForegroundColor Green
