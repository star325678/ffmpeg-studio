# Third-party notices

FFmpeg Studio v1.0.1 includes and/or derives from the following third-party works.
Each component remains under its own license.

---

## 1. FFmpeg 9.1

- Project: FFmpeg
- Website: https://ffmpeg.org/
- Source code: https://ffmpeg.org/releases/ffmpeg-9.1.tar.xz
- Source signature: https://ffmpeg.org/releases/ffmpeg-9.1.tar.xz.asc
- Git tag: `n9.1` (build commit: `74e4393595`)
- Windows build used: gyan.dev `ffmpeg-9.1-essentials_build`
- Build page: https://www.gyan.dev/ffmpeg/builds/
- Release asset: https://github.com/GyanD/codexffmpeg/releases/tag/9.1
- Build scripts: https://github.com/GyanD/codexffmpeg
- License: GNU General Public License version 3 (the build uses
  `--enable-gpl --enable-version3`)
- License text: `ffmpeg/LICENSE`
- Build notes: `ffmpeg/README.txt`
- Source and build information: `ffmpeg/SOURCE.txt`

The bundled programs are `ffmpeg.exe` and `ffprobe.exe`. They are invoked as
separate processes. FFmpeg Studio's own source code is not linked against
FFmpeg libraries.

GPLv3 compliance: the release that contains the FFmpeg binaries also provides
`ffmpeg-9.1-source.tar.gz`, a source snapshot generated from the official
FFmpeg git tag `n9.1`, and links to the official `ffmpeg-9.1.tar.xz` release
tarball, the exact build scripts, and the build configuration. The binaries are
unmodified official gyan.dev builds.

- Source snapshot: `ffmpeg-9.1-source.tar.gz` (git tag `n9.1`)
- Source snapshot SHA-256:
  `0AC7C9B9806B58EDA00A528DCBA316A2F33D291D949438900EFA811D04B051BD`

FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.
FFmpeg Studio is an independent project and is not affiliated with, endorsed
by, or sponsored by the FFmpeg project or gyan.dev.

---

## 2. Node.js 24.19.0

- Project: Node.js
- Website: https://nodejs.org/
- Source code: https://github.com/nodejs/node/tree/v24.19.0
- Binary: `runtime/node.exe` (Windows x64)
- License: MIT and the licenses of bundled dependencies
- License text: `runtime/LICENSE`

---

## 3. dinoosauro/ffmpeg-web

- Project: ffmpeg-web
- Repository: https://github.com/dinoosauro/ffmpeg-web
- License: MIT
- Copyright (c) 2023 Dinoosauro
- License text: `licenses/ffmpeg-web-LICENSE.txt`

FFmpeg Studio's feature organization and visual interaction patterns were
inspired by this project. The implementation here is a separate native
FFmpeg/Node.js application and does not include the project's ffmpeg.wasm
runtime or its Svelte application source.

---

## 4. Icons

All interface icons in `app/public/` are hand-authored inline SVG paths for
this project, following common outline-icon conventions. No icon font or
remote icon CDN is used.

---

## 5. Fonts

No fonts are bundled or downloaded. The interface uses the operating system's
local font stack (`Segoe UI`, `Microsoft YaHei UI`, and fallbacks).
