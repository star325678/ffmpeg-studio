#requires -Version 5.1
<#
.SYNOPSIS
    Download the pinned Node.js and FFmpeg builds used by FFmpeg Studio.
.DESCRIPTION
    Downloads Node.js 24.19.0 and FFmpeg 9.1 essentials, verifies SHA-256,
    and copies only the required files into runtime\ and ffmpeg\bin\.
    No administrator rights and no system PATH changes are required.
#>
[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $root 'runtime'
$ffmpegDir = Join-Path $root 'ffmpeg'
$ffmpegBin = Join-Path $ffmpegDir 'bin'
$tempDir = Join-Path $env:TEMP 'ffmpeg-studio-setup'

$nodeVersion = '24.19.0'
$nodeZipSha = '57F71AB3652E797D84ACDDC79C81CC9FF1C6DDB2A1974CDB83F00FEE9BFF4C73'
$nodeExeSha = '3602F2BB1A10F2CBAB4C36886218A33C1AB3DB87290E73B033C46C77147D0237'
$nodeUrls = @(
    "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip",
    "https://npmmirror.com/mirrors/node/v$nodeVersion/node-v$nodeVersion-win-x64.zip"
)

$ffmpegVersion = '9.1'
$ffmpegZipSha = 'B9BBBB3ACECE000CBEEC994F856649354E52C773807841E78908374B24D658FD'
$ffmpegExeSha = 'ED8F66CB877087A96F5BBB40A2944F0E764F2AD8870D5CB647360D912E62BC07'
$ffprobeExeSha = 'DF0199F606FAA88E9AD192732A7C3987ACFB647663534C297772E17730611A08'
$ffmpegUrls = @(
    "https://github.com/GyanD/codexffmpeg/releases/download/$ffmpegVersion/ffmpeg-$ffmpegVersion-essentials_build.zip",
    "https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-$ffmpegVersion-essentials_build.zip"
)

function Write-Step([string]$text) {
    Write-Host "[deps] $text" -ForegroundColor Cyan
}

function Assert-FileHash([string]$path, [string]$expected, [string]$label) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "$label is missing: $path"
    }
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
    if ($actual -ne $expected) {
        throw "$label SHA-256 mismatch.`nExpected: $expected`nActual:   $actual"
    }
    Write-Step "$label SHA-256 OK"
}

function Get-RemoteFile([string[]]$urls, [string]$destination, [string]$label) {
    if ((Test-Path -LiteralPath $destination) -and -not $Force) {
        Write-Step "Using cached $label archive"
        return
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    if (Test-Path -LiteralPath $destination) {
        Remove-Item -LiteralPath $destination -Force
    }
    foreach ($url in $urls) {
        try {
            Write-Step "Downloading $label from $url"
            & curl.exe -L --fail --retry 4 --retry-delay 2 -o $destination $url
            if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $destination)) {
                return
            }
        } catch {
            Write-Warning "Download failed: $($_.Exception.Message)"
        }
        if (Test-Path -LiteralPath $destination) {
            Remove-Item -LiteralPath $destination -Force
        }
    }
    throw "Could not download $label. Check your network and try again."
}

function Expand-ZipEntry([string]$zipPath, [string]$entryName, [string]$destination) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entry = $archive.GetEntry($entryName)
        if (-not $entry) {
            throw "Archive entry not found: $entryName"
        }
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destination, $true)
    } finally {
        $archive.Dispose()
    }
}

if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    throw 'curl.exe is required. It is included with Windows 10 1803 and later.'
}

New-Item -ItemType Directory -Force -Path $runtimeDir, $ffmpegBin, $tempDir | Out-Null

$nodeZip = Join-Path $tempDir "node-v$nodeVersion-win-x64.zip"
$ffmpegZip = Join-Path $tempDir "ffmpeg-$ffmpegVersion-essentials_build.zip"

if ($Force -or -not (Test-Path -LiteralPath (Join-Path $runtimeDir 'node.exe'))) {
    Get-RemoteFile -urls $nodeUrls -destination $nodeZip -label "Node.js $nodeVersion"
    Assert-FileHash -path $nodeZip -expected $nodeZipSha -label 'Node.js archive'
    Expand-ZipEntry -zipPath $nodeZip -entryName "node-v$nodeVersion-win-x64/node.exe" -destination (Join-Path $runtimeDir 'node.exe')
    Expand-ZipEntry -zipPath $nodeZip -entryName "node-v$nodeVersion-win-x64/LICENSE" -destination (Join-Path $runtimeDir 'LICENSE')
    Assert-FileHash -path (Join-Path $runtimeDir 'node.exe') -expected $nodeExeSha -label 'node.exe'
} else {
    Assert-FileHash -path (Join-Path $runtimeDir 'node.exe') -expected $nodeExeSha -label 'node.exe'
}

if ($Force -or -not (Test-Path -LiteralPath (Join-Path $ffmpegBin 'ffmpeg.exe'))) {
    Get-RemoteFile -urls $ffmpegUrls -destination $ffmpegZip -label "FFmpeg $ffmpegVersion"
    Assert-FileHash -path $ffmpegZip -expected $ffmpegZipSha -label 'FFmpeg archive'
    $prefix = "ffmpeg-$ffmpegVersion-essentials_build"
    Expand-ZipEntry -zipPath $ffmpegZip -entryName "$prefix/bin/ffmpeg.exe" -destination (Join-Path $ffmpegBin 'ffmpeg.exe')
    Expand-ZipEntry -zipPath $ffmpegZip -entryName "$prefix/bin/ffprobe.exe" -destination (Join-Path $ffmpegBin 'ffprobe.exe')
    Expand-ZipEntry -zipPath $ffmpegZip -entryName "$prefix/LICENSE" -destination (Join-Path $ffmpegDir 'LICENSE')
    Expand-ZipEntry -zipPath $ffmpegZip -entryName "$prefix/README.txt" -destination (Join-Path $ffmpegDir 'README.txt')
    Assert-FileHash -path (Join-Path $ffmpegBin 'ffmpeg.exe') -expected $ffmpegExeSha -label 'ffmpeg.exe'
    Assert-FileHash -path (Join-Path $ffmpegBin 'ffprobe.exe') -expected $ffprobeExeSha -label 'ffprobe.exe'
} else {
    Assert-FileHash -path (Join-Path $ffmpegBin 'ffmpeg.exe') -expected $ffmpegExeSha -label 'ffmpeg.exe'
    Assert-FileHash -path (Join-Path $ffmpegBin 'ffprobe.exe') -expected $ffprobeExeSha -label 'ffprobe.exe'
}

Write-Step "Node.js: $(& (Join-Path $runtimeDir 'node.exe') -v)"
Write-Step "FFmpeg:  $(& (Join-Path $ffmpegBin 'ffmpeg.exe') -version 2>&1 | Select-Object -First 1)"
Write-Step 'Dependencies are ready. Run Start.bat.'
