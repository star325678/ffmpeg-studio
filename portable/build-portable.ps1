#requires -Version 5.1
<#
.SYNOPSIS
    Build the FFmpeg Studio single-file portable EXE.
.DESCRIPTION
    Stages the application, creates a clean payload ZIP, compiles the C#
    launcher with the payload embedded as a resource, and writes the
    resulting EXE and SHA-256 checksum to dist\.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$version = '1.0.1'
$dist = Join-Path $root 'dist'
$stage = Join-Path $dist 'portable-payload'
$payload = Join-Path $dist "FFmpegStudio-payload-$version.zip"
$exe = Join-Path $dist "FFmpegStudio-Portable-$version.exe"
$shaFile = "$exe.sha256"
$launcher = Join-Path $PSScriptRoot 'Launcher.cs'
$icon = Join-Path $PSScriptRoot 'app.ico'

function Write-Step([string]$text) {
    Write-Host "[portable] $text" -ForegroundColor Cyan
}

$required = @(
    (Join-Path $root 'runtime\node.exe'),
    (Join-Path $root 'ffmpeg\bin\ffmpeg.exe'),
    (Join-Path $root 'ffmpeg\bin\ffprobe.exe'),
    (Join-Path $root 'app\server.js'),
    $launcher,
    $icon
)
foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required file: $path. Run scripts\setup-deps.ps1 first."
    }
}

if (Test-Path -LiteralPath $stage) {
    Remove-Item -LiteralPath $stage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stage, $dist | Out-Null

function Copy-IntoPayload([string]$relative) {
    $source = Join-Path $root $relative
    $destination = Join-Path $stage $relative
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Payload input is missing: $relative"
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
}

Write-Step 'Staging application files'
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
    Copy-IntoPayload $item
}

Write-Step 'Staging runtime and media engine'
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'runtime'), (Join-Path $stage 'ffmpeg\bin'), (Join-Path $stage 'data') | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'runtime\node.exe') -Destination (Join-Path $stage 'runtime\node.exe') -Force
Copy-Item -LiteralPath (Join-Path $root 'runtime\LICENSE') -Destination (Join-Path $stage 'runtime\LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $root 'ffmpeg\bin\ffmpeg.exe') -Destination (Join-Path $stage 'ffmpeg\bin\ffmpeg.exe') -Force
Copy-Item -LiteralPath (Join-Path $root 'ffmpeg\bin\ffprobe.exe') -Destination (Join-Path $stage 'ffmpeg\bin\ffprobe.exe') -Force
foreach ($item in @('LICENSE', 'README.txt', 'SOURCE.txt')) {
    Copy-Item -LiteralPath (Join-Path $root "ffmpeg\$item") -Destination (Join-Path $stage "ffmpeg\$item") -Force
}
Copy-Item -LiteralPath (Join-Path $root 'data\README.txt') -Destination (Join-Path $stage 'data\README.txt') -Force

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
    $target = Join-Path $stage $relative
    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Recurse -Force
    }
}

if (Test-Path -LiteralPath $payload) {
    Remove-Item -LiteralPath $payload -Force
}
Write-Step 'Creating payload ZIP'
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $stage,
    $payload,
    [System.IO.Compression.CompressionLevel]::Optimal,
    $false
)

Write-Step 'Compiling launcher'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $csc)) {
    $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
}
if (-not (Test-Path -LiteralPath $csc)) {
    throw 'The .NET Framework 4.x C# compiler (csc.exe) was not found.'
}

$cscArgs = @(
    '/nologo',
    '/target:winexe',
    '/platform:anycpu',
    '/optimize+',
    '/codepage:65001',
    ('/win32icon:' + $icon),
    ('/out:' + $exe),
    '/r:System.dll',
    '/r:System.Core.dll',
    '/r:System.Windows.Forms.dll',
    '/r:System.Drawing.dll',
    '/r:System.IO.Compression.dll',
    '/r:System.IO.Compression.FileSystem.dll',
    ('/resource:' + $payload + ',FFmpegStudio.Payload.zip'),
    ('/resource:' + $icon + ',FFmpegStudio.App.ico'),
    $launcher
)

& $csc @cscArgs
if ($LASTEXITCODE -ne 0) {
    throw "csc.exe failed with exit code $LASTEXITCODE"
}

$hash = (Get-FileHash -LiteralPath $exe -Algorithm SHA256).Hash
"$hash  $(Split-Path -Leaf $exe)" | Set-Content -LiteralPath $shaFile -Encoding ASCII
$sizeMb = [math]::Round((Get-Item -LiteralPath $exe).Length / 1MB, 1)

Write-Step "Created $exe ($sizeMb MB)"
Write-Step "SHA-256 $hash"

Remove-Item -LiteralPath $stage -Recurse -Force
Remove-Item -LiteralPath $payload -Force
Write-Step 'Build complete'
