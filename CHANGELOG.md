# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-11-25

### Added

- Rebuilt single-file portable launcher with its C# source included in
  `portable/`, so the EXE is reproducible from this repository.
- Splash progress during first-run payload extraction.
- System-tray menu for opening the workspace, data/output folders, and exiting
  the server process tree.
- `portable/build-portable.ps1` builds the clean payload and the single-file
  EXE with an embedded payload resource.
- SHA-256 checksums for the directory build and the portable EXE.

### Changed

- Portable app payload now uses FFmpeg 9.1 and contains no machine-specific
  setup notes or test data.
- Portable versioned app directory is `%LOCALAPPDATA%\FFmpegStudio\app-1.0.1`;
  user data stays in `%LOCALAPPDATA%\FFmpegStudio\data`.
- Version bumped to 1.0.1 across the server, UI, package metadata, and docs.

### Fixed

- Removed the unreproducible 1.0.0 portable launcher and its stale 9.0.2
  embedded payload.
- Added zip-entry path validation when extracting the embedded payload.

## [1.0.0] - 2026-11-25

### Added

- First public release of FFmpeg Studio for Windows x64.
- Browser-based workspace for batch conversion, trimming/editing, filters,
  text watermarks, GIF creation, image export, and ffprobe media inspection.
- Job queue with live progress, speed, ETA, cancellation, logs, and downloads.
- Engine page with encoder/filter detection and a one-click H.264 + AAC self-test.
- Portable directory build with bundled Node.js 24.19.0 and FFmpeg 9.1.
- Source-build scripts: dependency download/verification, release packaging,
  and smoke test.
- English and Chinese documentation, security policy, and third-party notices.

### Changed

- FFmpeg engine updated from 9.0.2 to 9.1 (2026-11-20).
- Removed machine-specific setup notes from the distributed package.
- Replaced preview screenshots with clean FFmpeg 9.1 captures.

### Security

- Local-only HTTP server bound to `127.0.0.1`.
- Upload extension allowlist, filename sanitization, path traversal checks,
  and a restrictive Content Security Policy.

[1.0.1]: ../../releases/tag/v1.0.1
[1.0.0]: ../../releases/tag/v1.0.0
