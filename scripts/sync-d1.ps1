# Push checked-in SQL state to remote D1.
# This is a destructive sync (drops/recreates tables before import).
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Remote D1 database name from wrangler config/environment.
$db = "v3_portfolio"

Write-Host "Dropping and recreating schema..." -ForegroundColor Cyan
# Keep drop order aligned with FK dependencies.
# Assumption: no additional tables outside this list need to survive the reset.
npx wrangler d1 execute $db --remote --yes --command "DROP TABLE IF EXISTS wiki_relationships; DROP TABLE IF EXISTS wiki_sections; DROP TABLE IF EXISTS wiki_quotes; DROP TABLE IF EXISTS wiki_info_links; DROP TABLE IF EXISTS wiki_info_rows; DROP TABLE IF EXISTS wiki_info_song; DROP TABLE IF EXISTS wiki_info_images; DROP TABLE IF EXISTS wiki_theme; DROP TABLE IF EXISTS wiki_entries; DROP TABLE IF EXISTS project_sections; DROP TABLE IF EXISTS portfolio_items; DROP TABLE IF EXISTS commission_pricing;"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Applying schema..." -ForegroundColor Cyan
# Base portfolio schema.
npx wrangler d1 execute $db --remote --yes --file=db/001_portfolio_schema.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Applying wiki schema..." -ForegroundColor Cyan
# Wiki-specific relational schema on top of the base tables.
npx wrangler d1 execute $db --remote --yes --file=db/002_wiki_schema.sql
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Importing wiki entries..." -ForegroundColor Cyan
# Seeds canonical wiki entry rows before dependent imports.
npx wrangler d1 execute $db --remote --yes --file=db/import-wiki.sql
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
# Quick row-count smoke checks to confirm seed/import completed.
npx wrangler d1 execute $db --remote --yes --command "SELECT count(*) as total FROM portfolio_items"
npx wrangler d1 execute $db --remote --yes --command "SELECT count(*) as total FROM wiki_entries"

Write-Host "Done!" -ForegroundColor Green
