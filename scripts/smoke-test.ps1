#requires -Version 5.1
<#
.SYNOPSIS
    Start the app, verify the API and run one FFmpeg self-test.
.DESCRIPTION
    Uses the bundled runtime\node.exe and ffmpeg\bin\ffmpeg.exe.
    Intended for local development and CI.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$node = Join-Path $root 'runtime\node.exe'
$server = Join-Path $root 'app\server.js'

if (-not (Test-Path -LiteralPath $node)) {
    throw "Missing $node. Run scripts\setup-deps.ps1 first."
}
if (-not (Test-Path -LiteralPath $server)) {
    throw "Missing $server."
}

function Get-FreePort {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    try {
        return ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
    } finally {
        $listener.Stop()
    }
}

$port = Get-FreePort
$work = Join-Path $env:TEMP ("ffmpeg-studio-smoke-" + [guid]::NewGuid().ToString('N'))
$data = Join-Path $work 'data'
New-Item -ItemType Directory -Force -Path $data | Out-Null
$stdout = Join-Path $work 'stdout.log'
$stderr = Join-Path $work 'stderr.log'

$env:PORT = [string]$port
$env:FFSTUDIO_DATA = $data
$env:FFSTUDIO_OPEN = '0'

$process = Start-Process -FilePath $node -ArgumentList @("`"$server`"") -WorkingDirectory $root -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr

try {
    $health = $null
    for ($i = 0; $i -lt 60; $i++) {
        if ($process.HasExited) {
            throw "Server exited with code $($process.ExitCode)."
        }
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/health" -TimeoutSec 2
            break
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $health) {
        throw "Server did not become healthy on port $port."
    }
    if (-not $health.ok) {
        throw "Health check returned ok=false."
    }
    if ($health.ffmpegVersion -notmatch '^9\.1') {
        throw "Unexpected FFmpeg version: $($health.ffmpegVersion)"
    }
    Write-Host "[smoke] health OK: FFmpeg $($health.ffmpegVersion)"

    $page = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 10
    if ($page.StatusCode -ne 200 -or $page.Content -notmatch 'FFmpeg Studio') {
        throw "Unexpected index page response."
    }
    Write-Host "[smoke] index OK: HTTP $($page.StatusCode)"

    Write-Host '[smoke] running FFmpeg self-test...'
    $test = Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/selftest" -Method Post -TimeoutSec 120
    if (-not $test.ok) {
        throw "Self-test failed: $($test.error)"
    }
    Write-Host "[smoke] self-test OK: $($test.elapsedMs) ms, $($test.size) bytes"

    Write-Host '[smoke] PASS'
} catch {
    Write-Host '[smoke] FAIL' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if (Test-Path -LiteralPath $stdout) {
        Write-Host '--- stdout ---'
        Get-Content -LiteralPath $stdout -Tail 40
    }
    if (Test-Path -LiteralPath $stderr) {
        Write-Host '--- stderr ---'
        Get-Content -LiteralPath $stderr -Tail 40
    }
    throw
} finally {
    if ($process -and -not $process.HasExited) {
        & taskkill.exe /PID $process.Id /T /F 2>&1 | Out-Null
    }
    Start-Sleep -Milliseconds 300
    if (Test-Path -LiteralPath $work) {
        Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue
    }
}
