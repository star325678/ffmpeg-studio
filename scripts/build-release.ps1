#requires -Version 5.1
<#
.SYNOPSIS
    Build the portable release ZIP from this source tree.
.DESCRIPTION
    Requires runtime\node.exe and ffmpeg\bin\ffmpeg.exe to be present.
    Produces dist\FFmpegStudio-1.0.1-win64.zip and a .sha256 file.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$version = '1.0.1'
$dist = Join-Path $root 'dist'
$stageRoot = Join-Path $dist 'stage'
$stageApp = Join-Path $stageRoot 'FFmpegStudio'
$zip = Join-Path $dist "FFmpegStudio-$version-win64.zip"
$shaFile = "$zip.sha256"

function Write-Step([string]$text) {
    Write-Host "[release] $text" -ForegroundColor Cyan
}

$required = @(
    (Join-Path $root 'runtime\node.exe'),
    (Join-Path $root 'ffmpeg\bin\ffmpeg.exe'),
    (Join-Path $root 'ffmpeg\bin\ffprobe.exe'),
    (Join-Path $root 'app\server.js'),
    (Join-Path $root 'Start.bat')
)
foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required file: $path. Run scripts\setup-deps.ps1 first."
    }
}

if (Test-Path -LiteralPath $stageRoot) {
    Remove-Item -LiteralPath $stageRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stageApp | Out-Null

function Copy-IntoStage([string]$relative) {
    $source = Join-Path $root $relative
    $destination = Join-Path $stageApp $relative
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Release input is missing: $relative"
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
}

Write-Step 'Copying application files'
foreach ($item in @(
    'app',
    'docs',
    'licenses',
    'portable',
    'scripts',
    'Start.bat',
    'Stop.bat',
    'README.md',
    'README.en.md',
    'LICENSE',
    'THIRD_PARTY_NOTICES.md',
    'SECURITY.md',
    'CHANGELOG.md',
    'BUILD_INFO.txt',
    'VERSION.txt',
    'package.json'
)) {
    if (Test-Path -LiteralPath (Join-Path $root $item)) {
        Copy-IntoStage $item
    }
}

Write-Step 'Copying runtime and media engine'
New-Item -ItemType Directory -Force -Path (Join-Path $stageApp 'runtime'), (Join-Path $stageApp 'ffmpeg\bin') | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'runtime\node.exe') -Destination (Join-Path $stageApp 'runtime\node.exe') -Force
Copy-Item -LiteralPath (Join-Path $root 'runtime\LICENSE') -Destination (Join-Path $stageApp 'runtime\LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $root 'ffmpeg\bin\ffmpeg.exe') -Destination (Join-Path $stageApp 'ffmpeg\bin\ffmpeg.exe') -Force
Copy-Item -LiteralPath (Join-Path $root 'ffmpeg\bin\ffprobe.exe') -Destination (Join-Path $stageApp 'ffmpeg\bin\ffprobe.exe') -Force
foreach ($item in @('LICENSE', 'README.txt', 'SOURCE.txt')) {
    Copy-Item -LiteralPath (Join-Path $root "ffmpeg\$item") -Destination (Join-Path $stageApp "ffmpeg\$item") -Force
}

Write-Step 'Preparing data directory'
New-Item -ItemType Directory -Force -Path (Join-Path $stageApp 'data') | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'data\README.txt') -Destination (Join-Path $stageApp 'data\README.txt') -Force

# Remove files that must never be distributed.
$forbidden = @(
    '本地FFmpeg更新说明.md',
    'data\server.json',
    'data\jobs',
    'data\uploads',
    'data\outputs',
    'data\thumbs',
    'data\media',
    'data\temp'
)
foreach ($relative in $forbidden) {
    $target = Join-Path $stageApp $relative
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Recurse -Force
        Write-Step "Removed non-distributable path: $relative"
    }
}

if (Test-Path -LiteralPath $zip) {
    Remove-Item -LiteralPath $zip -Force
}
New-Item -ItemType Directory -Force -Path $dist | Out-Null

Write-Step 'Compressing ZIP'
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $stageRoot,
    $zip,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)

$hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
"$hash  $(Split-Path -Leaf $zip)" | Set-Content -LiteralPath $shaFile -Encoding ASCII
$sizeMb = [math]::Round((Get-Item -LiteralPath $zip).Length / 1MB, 1)

Write-Step "Created $zip ($sizeMb MB)"
Write-Step "SHA-256 $hash"
Write-Step "Checksum file $shaFile"
