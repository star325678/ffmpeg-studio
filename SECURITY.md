# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Please use GitHub's **Report a vulnerability** feature under the repository's
**Security** tab (private vulnerability reporting). If that is unavailable,
open a minimal issue asking for a private contact channel; do not include
exploit details in a public issue.

Include:

- FFmpeg Studio version and Windows version
- Steps to reproduce
- Expected and actual behavior
- Impact assessment
- Any relevant logs, with personal paths and media removed

This is a volunteer project; there is no bug bounty. Reports are acknowledged
as soon as possible, usually within a few days.

## Threat model and supported deployment

FFmpeg Studio is designed as a **single-user, local-only** application:

- The server binds to `127.0.0.1`. There is no authentication, no TLS, and no
  authorization layer.
- Running it behind a reverse proxy, exposing it to a LAN, port-forwarding it,
  or tunneling it to the internet is **not supported** and is considered a
  misconfiguration, not a vulnerability in the default setup.
- The browser UI and the local server share the same user account. Any process
  running as that user can already read the same files.
- Uploaded media is processed by native FFmpeg as the current user. A malicious
  media file can exploit bugs in FFmpeg or its libraries; this is why the app
  does not sandbox FFmpeg and why users should keep the engine updated.
- The release binaries are not code-signed. Verify the SHA-256 checksum and
  obtain builds only from this repository's Releases.

## Security controls in the app

- Upload extension allowlist and a configurable size limit (20 GB by default)
- Sanitized display names; files stored under random UUID names
- Static-file path traversal check
- Content Security Policy, `X-Content-Type-Options: nosniff`,
  `frame-ancestors 'none'`
- FFmpeg invoked with `spawn` and an argument array, never through a shell
- Output and download paths restricted to the configured data directory
- `Stop.bat` verifies the process executable path and command line before
  terminating it

## Hardening recommendations

- Keep the app in a directory writable only by your user account.
- Do not run the app as Administrator.
- Back up `data/outputs/` before deleting or moving the app.
- Replace `ffmpeg/bin/ffmpeg.exe` and `ffprobe.exe` when security updates are
  released, then run the built-in self-test.
- If you need remote access, use a remote desktop solution rather than exposing
  the HTTP port.

---

## 中文摘要

本项目是单用户、本机运行的工具，只监听 `127.0.0.1`，没有登录和远程访问设计。
不要把端口映射到局域网或公网，这属于不受支持的使用方式。安全问题请通过
GitHub 仓库 **Security → Report a vulnerability** 私下报告；不要在公开 Issue
中贴出可利用细节。发布包未做商业代码签名，请校验 SHA-256 后使用。
