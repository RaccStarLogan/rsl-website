# Build the site, reseed local D1 from SQL files, then run local Wrangler dev.
# Intended for a clean local preview where DB state matches checked-in SQL.
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$distConfigPath = Join-Path $repoRoot "dist/server/wrangler.json"
$dbStatePath = Join-Path $repoRoot ".wrangler/local-preview-db-state.json"
$localWranglerCliPath = Join-Path $repoRoot "node_modules/wrangler/bin/wrangler.js"

# Ensure all relative paths (for example db/*.sql passed to Wrangler) resolve
# from the repository root no matter where the script was launched.
Set-Location -LiteralPath $repoRoot

# Script-owned console output helpers. Bright colors make status lines easier to
# distinguish from the underlying command output in the terminal.
function Write-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Message
  )

  $totalStepsVar = Get-Variable -Name TotalSteps -Scope Script -ErrorAction SilentlyContinue
  if ($null -ne $totalStepsVar -and $totalStepsVar.Value -gt 0) {
    if (-not (Get-Variable -Name StepNumber -Scope Script -ErrorAction SilentlyContinue)) {
      $script:StepNumber = 0
    }
    $script:StepNumber++
    Write-Host ("Step {0} of {1}: {2}" -f $script:StepNumber, $totalStepsVar.Value, $Message) -ForegroundColor Yellow
  } else {
    Write-Host $Message -ForegroundColor Yellow
  }
}

function Write-WarnStep {
  param(
    [Parameter(Mandatory = $true)][string]$Message
  )

  Write-Host $Message -ForegroundColor Red
}

function Write-Skip {
  param(
    [Parameter(Mandatory = $true)][string]$Message
  )

  Write-Host $Message -ForegroundColor DarkYellow
}

function Invoke-QuietProcess {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$ArgumentList
  )

  $psi = [System.Diagnostics.ProcessStartInfo]::new()
  $psi.FileName = $FilePath
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  foreach ($arg in $ArgumentList) {
    [void]$psi.ArgumentList.Add($arg)
  }

  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $psi
  [void]$process.Start()
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()

  $printedDots = $false
  while (-not $process.WaitForExit(500)) {
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    $printedDots = $true
  }
  # Ensure output reads are fully drained after process exit.
  $process.WaitForExit()

  if ($printedDots) {
    Write-Host ""
  }

  $stdout = $stdoutTask.GetAwaiter().GetResult()
  $stderr = $stderrTask.GetAwaiter().GetResult()

  [pscustomobject]@{
    ExitCode = $process.ExitCode
    Output   = $stdout + $stderr
  }
}

function Get-WranglerInvocation {
  param(
    [Parameter(Mandatory = $true)][string[]]$WranglerArgs
  )

  if (Test-Path -LiteralPath $localWranglerCliPath) {
    return [pscustomobject]@{
      FilePath     = "node"
      ArgumentList = @($localWranglerCliPath) + $WranglerArgs
    }
  }

  return [pscustomobject]@{
    FilePath     = "npx"
    ArgumentList = @("wrangler") + $WranglerArgs
  }
}

function Invoke-D1Command {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )

  Write-Verbose "D1 command: $Command"
  $wrangler = Get-WranglerInvocation -WranglerArgs @("d1", "execute", "v3_portfolio", "--local", "--config", $distConfigPath, "--command", $Command)
  $result = Invoke-QuietProcess -FilePath $wrangler.FilePath -ArgumentList $wrangler.ArgumentList
  if ($result.ExitCode -ne 0) {
    if (-not [string]::IsNullOrWhiteSpace($result.Output)) {
      Write-Host ($result.Output.TrimEnd()) -ForegroundColor Red
    }
    exit 1
  }
}

function Get-D1CommandOutput {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )

  Write-Verbose "D1 command (captured): $Command"
  $wrangler = Get-WranglerInvocation -WranglerArgs @("d1", "execute", "v3_portfolio", "--local", "--config", $distConfigPath, "--command", $Command)
  $result = Invoke-QuietProcess -FilePath $wrangler.FilePath -ArgumentList $wrangler.ArgumentList
  if ($result.ExitCode -ne 0) {
    if (-not [string]::IsNullOrWhiteSpace($result.Output)) {
      Write-Host ($result.Output.TrimEnd()) -ForegroundColor Red
    }
    exit 1
  }
  $result.Output
}

function Invoke-D1File {
  param(
    [Parameter(Mandatory = $true)][string]$Description,
    [Parameter(Mandatory = $true)][string]$File
  )

  Write-Step $Description
  Write-Verbose "D1 file: $File"
  $wrangler = Get-WranglerInvocation -WranglerArgs @("d1", "execute", "v3_portfolio", "--local", "--config", $distConfigPath, "--file=$File")
  $result = Invoke-QuietProcess -FilePath $wrangler.FilePath -ArgumentList $wrangler.ArgumentList
  if ($result.ExitCode -ne 0) {
    if (-not [string]::IsNullOrWhiteSpace($result.Output)) {
      Write-Host ($result.Output.TrimEnd()) -ForegroundColor Red
    }
    exit 1
  }
}

# Track each seed file independently so unchanged imports can be skipped on
# later runs once the local DB is already initialized.
$trackedFiles = @(
  "db/001_portfolio_schema.sql"
  "db/002_wiki_schema.sql"
  "db/import-wiki.sql"
  "db/import-sfw.sql"
  "db/import-nsfw.sql"
  "db/commission-pricing.sql"
)

$currentState = [ordered]@{}
foreach ($relativePath in $trackedFiles) {
  $absolutePath = Join-Path $repoRoot $relativePath
  $currentState[$relativePath] = (Get-FileHash -Algorithm SHA256 -LiteralPath $absolutePath).Hash
}

# Read the previous hash snapshot, if one exists.
$previousState = @{}
if (Test-Path -LiteralPath $dbStatePath) {
  $rawState = Get-Content -LiteralPath $dbStatePath -Raw | ConvertFrom-Json -AsHashtable
  if ($null -ne $rawState) {
    $previousState = $rawState
  }
}

$changedFiles = @(
  foreach ($relativePath in $trackedFiles) {
    if (-not $previousState.ContainsKey($relativePath) -or $previousState[$relativePath] -ne $currentState[$relativePath]) {
      $relativePath
    }
  }
)

# Work out which parts of the seed pipeline actually need to run. Schema changes
# fan out to dependent imports so the DB stays internally consistent.
$needsPortfolioSchema = $changedFiles -contains "db/001_portfolio_schema.sql"
$needsWikiSchema = $changedFiles -contains "db/002_wiki_schema.sql"
$needsWikiImport = $needsWikiSchema -or ($changedFiles -contains "db/import-wiki.sql")
$needsPortfolioImport = $needsPortfolioSchema -or ($changedFiles -contains "db/import-sfw.sql") -or ($changedFiles -contains "db/import-nsfw.sql")
$needsCommissionImport = $needsPortfolioSchema -or ($changedFiles -contains "db/commission-pricing.sql")
$shouldSeed = $needsPortfolioSchema -or $needsWikiSchema -or $needsWikiImport -or $needsPortfolioImport -or $needsCommissionImport
$needsBuild = $true

Write-Verbose ("Changed db files: " + ($(if ($changedFiles.Count -gt 0) { $changedFiles -join ", " } else { "(none)" })))
Write-Verbose "needsPortfolioSchema=$needsPortfolioSchema needsWikiSchema=$needsWikiSchema needsWikiImport=$needsWikiImport needsPortfolioImport=$needsPortfolioImport needsCommissionImport=$needsCommissionImport needsBuild=$needsBuild"

if ($needsBuild) {
  Write-Step "Building..."
  # Run only astro build (skip the Pages patcher which restructures dist/)
  npx astro build
  if ($LASTEXITCODE -ne 0) { exit 1 }

  # Patch generated config for local wrangler dev
  $raw = Get-Content $distConfigPath -Raw
  $raw -replace '"pages_build_output_dir":"[^"]*",?' | Set-Content $distConfigPath -NoNewline
}

# The hash cache is only trustworthy if the local D1 database already contains
# the core tables the app expects. If not, force a full bootstrap seed.
$dbReady = $false
if (Test-Path -LiteralPath $distConfigPath) {
  $statusOutput = Get-D1CommandOutput "SELECT CASE WHEN EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'portfolio_items') AND EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'commission_pricing') AND EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'wiki_entries') THEN 'ready' ELSE 'missing' END AS status;"
  $dbReady = $statusOutput -match '\bready\b'
  Write-Verbose "Local D1 readiness probe: $($statusOutput.Trim())"
}

if (-not $dbReady) {
  Write-WarnStep "Local D1 schema is missing or incomplete. Forcing a full reseed..."
  $needsPortfolioSchema = $true
  $needsWikiSchema = $true
  $needsWikiImport = $true
  $needsPortfolioImport = $true
  $needsCommissionImport = $true
  $shouldSeed = $true
}

$script:StepNumber = 0
$script:TotalSteps = 1 # Start local server

if ($shouldSeed) {
  $script:TotalSteps++ # Start seeding

  if ($needsPortfolioSchema) { $script:TotalSteps += 2 } # Reset + apply schema
  if ($needsWikiSchema) { $script:TotalSteps += 2 } # Reset + apply schema

  if ($needsWikiImport) {
    if (-not $needsWikiSchema) { $script:TotalSteps++ } # Ensure schema
    $script:TotalSteps += 2 # Clear + import
  }

  if ($needsPortfolioImport) {
    if (-not $needsPortfolioSchema) { $script:TotalSteps++ } # Ensure schema
    $script:TotalSteps += 3 # Clear + SFW + NSFW
  }

  if ($needsCommissionImport) {
    if (-not $needsPortfolioSchema) { $script:TotalSteps++ } # Ensure schema
    $script:TotalSteps += 2 # Clear + import
  }
}

if ($shouldSeed) {
  Write-Step "Seeding local D1..."
  if ($needsPortfolioSchema) {
    Write-Step "Resetting portfolio schema tables..."
    Invoke-D1Command "DROP TABLE IF EXISTS project_sections; DROP TABLE IF EXISTS portfolio_items; DROP TABLE IF EXISTS commission_pricing;"
    Invoke-D1File "Applying portfolio schema..." "db/001_portfolio_schema.sql"
  }

  if ($needsWikiSchema) {
    Write-Step "Resetting wiki schema tables..."
    Invoke-D1Command "DROP TABLE IF EXISTS wiki_relationships; DROP TABLE IF EXISTS wiki_trivia; DROP TABLE IF EXISTS wiki_sections; DROP TABLE IF EXISTS wiki_quotes; DROP TABLE IF EXISTS wiki_info_links; DROP TABLE IF EXISTS wiki_info_rows; DROP TABLE IF EXISTS wiki_info_song; DROP TABLE IF EXISTS wiki_info_images; DROP TABLE IF EXISTS wiki_theme; DROP TABLE IF EXISTS wiki_entries;"
    Invoke-D1File "Applying wiki schema..." "db/002_wiki_schema.sql"
  }

  # Re-apply schema before import-only runs so the script self-heals if the
  # local DB was deleted but the SQL files themselves did not change.
  if ($needsWikiImport) {
    if (-not $needsWikiSchema) {
      Invoke-D1File "Applying wiki schema..." "db/002_wiki_schema.sql"
    }
    Write-Step "Clearing wiki data..."
    Invoke-D1Command "DELETE FROM wiki_entries;"
    Invoke-D1File "Importing wiki data..." "db/import-wiki.sql"
  }

  if ($needsPortfolioImport) {
    if (-not $needsPortfolioSchema) {
      Invoke-D1File "Applying portfolio schema..." "db/001_portfolio_schema.sql"
    }
    Write-Step "Clearing portfolio import data..."
    Invoke-D1Command "DELETE FROM portfolio_items;"
    Invoke-D1File "Importing SFW portfolio data..." "db/import-sfw.sql"
    Invoke-D1File "Importing NSFW portfolio data..." "db/import-nsfw.sql"
  }

  if ($needsCommissionImport) {
    if (-not $needsPortfolioSchema) {
      Invoke-D1File "Applying portfolio schema..." "db/001_portfolio_schema.sql"
    }
    Write-Step "Clearing commission pricing..."
    Invoke-D1Command "DELETE FROM commission_pricing;"
    Invoke-D1File "Importing commission pricing..." "db/commission-pricing.sql"
  }

  # Persist the new hash snapshot only after all seed work succeeds.
  $stateDir = Split-Path -Parent $dbStatePath
  if (-not (Test-Path -LiteralPath $stateDir)) {
    New-Item -ItemType Directory -Path $stateDir | Out-Null
  }
  $currentState | ConvertTo-Json | Set-Content -LiteralPath $dbStatePath -NoNewline
} else {
  Write-Skip "No changes detected in db/. Skipping D1 seeding."
}

Write-Step "Starting local server..."
npx wrangler dev --config $distConfigPath --local
