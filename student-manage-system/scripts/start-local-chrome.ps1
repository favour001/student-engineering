param(
  [string]$FrontendUrl = 'http://localhost:3000/login',
  [string]$BackendApiUrl = 'http://localhost:8888/api',
  [int]$RemoteDebuggingPort = 9222
)

$chromeCandidates = @(
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
)

$chromePath = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chromePath) {
  throw 'Chrome was not found on this machine.'
}

$appProfileRoot =
  if ($env:LOCALAPPDATA) {
    Join-Path $env:LOCALAPPDATA 'student-manage-system'
  } else {
    Join-Path $env:TEMP 'student-manage-system'
  }

if (-not (Test-Path $appProfileRoot)) {
  New-Item -ItemType Directory -Path $appProfileRoot | Out-Null
}

$profileDir = Join-Path $appProfileRoot 'chrome-local-profile'
$profileDir = [System.IO.Path]::GetFullPath($profileDir)
if (-not (Test-Path $profileDir)) {
  New-Item -ItemType Directory -Path $profileDir | Out-Null
}

$arguments = @(
  '--new-window',
  "--user-data-dir=$profileDir",
  "--remote-debugging-port=$RemoteDebuggingPort",
  '--disable-session-crashed-bubble',
  '--disable-infobars',
  $FrontendUrl,
  $BackendApiUrl
)

Write-Host 'Launching Chrome'
Write-Host "  Frontend: $FrontendUrl"
Write-Host "  Backend API: $BackendApiUrl"
Write-Host "  Profile: $profileDir"
Write-Host "  Debug Port: $RemoteDebuggingPort"

Start-Process -FilePath $chromePath -ArgumentList $arguments
