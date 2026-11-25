$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
$stateFile = Join-Path $root 'data\server.json'
$expectedNode = Join-Path $root 'runtime\node.exe'
$expectedScript = Join-Path $root 'app\server.js'

if (-not (Test-Path -LiteralPath $stateFile)) {
    Write-Host '[FFmpeg Studio] No running local service was found.'
    exit 0
}

$state = $null
try {
    $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
} catch {}

$serverPid = 0
if ($state -and $state.pid) {
    [void][int]::TryParse([string]$state.pid, [ref]$serverPid)
}

if ($serverPid -le 0) {
    Remove-Item -LiteralPath $stateFile -Force
    Write-Host '[FFmpeg Studio] Removed a stale service record.'
    exit 0
}

$proc = Get-CimInstance Win32_Process -Filter "ProcessId=$serverPid"
$exePath = ''
$commandLine = ''
if ($proc) {
    $exePath = [string]$proc.ExecutablePath
    $commandLine = [string]$proc.CommandLine
}

$normalizedExpected = [System.IO.Path]::GetFullPath($expectedNode)
$normalizedActual = if ($exePath) { [System.IO.Path]::GetFullPath($exePath) } else { '' }
$isOurServer = $proc -and
    ($normalizedActual -ieq $normalizedExpected) -and
    ([regex]::IsMatch($commandLine, 'app[\\/]server\.js', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase))

if ($isOurServer) {
    & taskkill.exe /PID $serverPid /T /F | Out-Null
    Start-Sleep -Milliseconds 500
    Remove-Item -LiteralPath $stateFile -Force
    Write-Host '[FFmpeg Studio] Service stopped.'
    exit 0
}

Remove-Item -LiteralPath $stateFile -Force
Write-Host '[FFmpeg Studio] No matching service process was found; stale record removed.'
exit 0
