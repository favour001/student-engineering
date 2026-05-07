param(
  [string]$HostName = "43.139.231.122",
  [string]$User = "root",
  [int]$Port = 22,
  [string]$KeyPath = "C:\Users\admin\.ssh\id_ed25519",
  [string]$ServerRemoteDir = "/www/wwwroot/student-admin-server",
  [string]$WebRemoteDir = "/www/wwwroot/student-admin-web",
  [int]$CommandTimeoutSeconds = 30,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$ServerDir = Join-Path $Root "student-manager-server"
$WebDir = Join-Path $Root "student-manage-web"
$ArtifactsDir = Join-Path $Root ".deploy"
$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$Remote = "$User@$HostName"
$SshBaseArgs = @("-i", $KeyPath, "-p", "$Port", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10")
$ScpBaseArgs = @("-i", $KeyPath, "-P", "$Port", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10")

function Invoke-Step {
  param(
    [string]$Title,
    [scriptblock]$Command
  )

  Write-Host "==> $Title"
  & $Command
}

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$WorkingDirectory = $Root,
    [int]$TimeoutSeconds = $CommandTimeoutSeconds
  )

  $process = Start-Process `
    -FilePath $FilePath `
    -ArgumentList $Arguments `
    -WorkingDirectory $WorkingDirectory `
    -NoNewWindow `
    -PassThru

  if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
    try {
      $process.Kill($true)
    } catch {
      $process.Kill()
    }
    throw "$FilePath timed out after ${TimeoutSeconds}s"
  }

  $process.Refresh()
  if ($process.ExitCode -ne 0) {
    throw "$FilePath exited with code $($process.ExitCode)"
  }
}

function Invoke-Remote {
  param([string]$Command)
  $escapedCommand = $Command.Replace("'", "'\''")
  $wrappedCommand = "timeout ${CommandTimeoutSeconds}s bash -lc '$escapedCommand'"
  Invoke-Checked -FilePath "ssh" -Arguments ($SshBaseArgs + @($Remote, $wrappedCommand))
}

function Copy-ToRemote {
  param(
    [string]$LocalPath,
    [string]$RemotePath
  )

  Invoke-Checked -FilePath "scp" -Arguments ($ScpBaseArgs + @($LocalPath, "${Remote}:$RemotePath"))
}

function New-TarGz {
  param(
    [string]$ArchivePath,
    [string]$WorkingDirectory,
    [string[]]$Items
  )

  if (Test-Path $ArchivePath) {
    Remove-Item -LiteralPath $ArchivePath -Force
  }

  Invoke-Checked -FilePath "tar" -Arguments (@("-czf", $ArchivePath) + $Items) -WorkingDirectory $WorkingDirectory
}

Invoke-Step "Prepare artifacts directory" {
  New-Item -ItemType Directory -Force -Path $ArtifactsDir | Out-Null
}

if (-not $SkipBuild) {
  Invoke-Step "Build backend" {
    Invoke-Checked -FilePath "yarn" -Arguments @("build") -WorkingDirectory $ServerDir
  }

  Invoke-Step "Build admin web" {
    Invoke-Checked -FilePath "yarn" -Arguments @("build") -WorkingDirectory $WebDir
  }
}

$ServerArchive = Join-Path $ArtifactsDir "student-admin-server-$Timestamp.tar.gz"
$WebArchive = Join-Path $ArtifactsDir "student-admin-web-$Timestamp.tar.gz"

Invoke-Step "Package backend" {
  New-TarGz `
    -ArchivePath $ServerArchive `
    -WorkingDirectory $ServerDir `
    -Items @("dist", "package.json", "yarn.lock", "script")
}

Invoke-Step "Package admin web" {
  New-TarGz `
    -ArchivePath $WebArchive `
    -WorkingDirectory $WebDir `
    -Items @(".next", "public", "package.json", "yarn.lock", "next.config.js", ".env.production")
}

Invoke-Step "Create remote release directories" {
  Invoke-Remote "mkdir -p '$ServerRemoteDir/releases' '$WebRemoteDir/releases'"
}

$RemoteServerArchive = "$ServerRemoteDir/releases/server-$Timestamp.tar.gz"
$RemoteWebArchive = "$WebRemoteDir/releases/web-$Timestamp.tar.gz"

Invoke-Step "Upload backend archive" {
  Copy-ToRemote -LocalPath $ServerArchive -RemotePath $RemoteServerArchive
}

Invoke-Step "Upload admin web archive" {
  Copy-ToRemote -LocalPath $WebArchive -RemotePath $RemoteWebArchive
}

Invoke-Step "Deploy backend on server" {
  Invoke-Remote @"
set -e
cd '$ServerRemoteDir'
mkdir -p '.backup'
if [ -d dist ]; then mv dist ".backup/dist-$Timestamp"; fi
tar -xzf '$RemoteServerArchive' -C '$ServerRemoteDir'
pm2 delete student-admin-server >/dev/null 2>&1 || true
pm2 start dist/src/main.js --name student-admin-server
pm2 save
"@
}

Invoke-Step "Deploy admin web on server" {
  Invoke-Remote @"
set -e
cd '$WebRemoteDir'
mkdir -p '.backup'
if [ -d .next ]; then mv .next ".backup/.next-$Timestamp"; fi
tar -xzf '$RemoteWebArchive' -C '$WebRemoteDir'
pm2 delete student-admin-web >/dev/null 2>&1 || true
pm2 start yarn --name student-admin-web -- start
pm2 save
"@
}

Invoke-Step "Check PM2 status" {
  Invoke-Remote "pm2 list"
}
