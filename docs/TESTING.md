# 测试说明

FFmpeg Studio 1.0.1 的测试分为三层：API/引擎、浏览器端到端、发布包。

## 测试环境

| 项目 | 值 |
|---|---|
| 日期 | 2026-11-25 |
| 系统 | Windows 11 26100 x64 |
| 浏览器 | Microsoft Edge 158（Chromium） |
| 应用 | FFmpeg Studio 1.0.1 |
| 引擎 | FFmpeg 9.1-essentials_build-www.gyan.dev |
| 运行时 | Node.js 24.19.0 |
| 素材 | FFmpeg `mandelbrot` / `sine` 生成的合成视频、图片、音频 |

## 1. API 与引擎

在 FFmpeg 9.1 上重新执行：

- `GET /api/health`：返回 `ok: true`，`ffmpegVersion` 为 `9.1-essentials_build-www.gyan.dev`
- `GET /api/system`：识别 222 个编码器、530 个滤镜，返回二进制路径和磁盘信息
- `POST /api/selftest`：生成 2 秒 640×360 测试视频，完成 H.264 + AAC 编码和 ffprobe 解析（本次约 280 ms，输出约 130 KB）
- 上传 MP4、PNG、MP3 三种素材，ffprobe 正确识别容器、流、时长和分辨率
- 转换 MP4（H.264 + AAC，1080p）、M4A（AAC）、WEBP，输出经 ffprobe 复核
- 404 与静态目录路径穿越拦截
- 发布 ZIP 在全新目录解压后，用包内 `runtime\node.exe` 启动，健康检查和自检通过
- `Stop.bat` 校验进程路径和命令行后停止服务，未误杀其他 Node 进程

### 历史基线

2026-10-26 在 FFmpeg 9.0.2 上执行过 22 项 API 集成检查，覆盖：

上传、探测、缩略图、HTTP Range、非法扩展名拒绝、路径穿越拦截、
M4A/MP3/WEBM/GIF/WEBP 转换、剪辑（裁剪 + 2× 变速 + 缩放 + 中文水印）、
命令预览、输出下载、排队/运行中取消、自检、404。

## 2. 浏览器端到端

使用 Playwright 驱动真实 Edge：

- 工作台加载、版本徽章、无控制台错误
- 上传真实 MP4，自动进入格式转换
- 参数绑定：CRF、输出文件名、格式卡片、命令预览同步
- 取消全选、仅勾选单个文件、批量任务按钮计数
- 提交转换任务，跳转任务队列，轮询到完成
- 任务详情弹窗、日志、下载链接和文件大小
- 剪辑页：起点/终点滑块、裁剪、中文文字水印、1.5× 变速
- 剪辑输出 ffprobe 复核：720×720、3.333 秒，音频同步
- 媒体信息页：核心参数、流数量、原始 JSON
- 引擎页自检：按钮状态、结果面板
- 390 px 移动端：无横向溢出、侧边栏打开/关闭
- 实时进度增长与 UI 取消任务
- 桌面 1440 px 和移动端 390 px 均无横向滚动

本次发布使用的截图由同一套 Playwright 脚本在 FFmpeg 9.1 上重新生成，
素材和任务均为合成数据。

## 3. 发布包

- `scripts/build-release.ps1` 从源码树生成 ZIP，并写入 `.sha256`
- ZIP 解压到全新目录，不依赖系统 Node.js / FFmpeg
- `/api/health` 返回 9.1；`/api/media` 为空；首页 HTTP 200
- 上传、转换、缩略图、下载、自检均通过
- 包内不含 `本地FFmpeg更新说明.md`、`server.json`、上传文件或任务记录

## 4. 单文件便携版

- `portable/build-portable.ps1` 重新生成净化 payload，并用 .NET Framework 4.8 的 `csc.exe` 编译 `portable/Launcher.cs`
- EXE 内嵌 payload、应用图标和托盘图标；首次运行解压到 `%LOCALAPPDATA%\FFmpegStudio\app-1.0.1`
- 数据目录独立为 `%LOCALAPPDATA%\FFmpegStudio\data`
- 首次启动（已清空缓存）：约 6–9 秒，包含解压、启动服务和打开浏览器
- 第二次启动：约 0.27–0.35 秒，复用已有实例，不重复监听端口
- 便携版 `/api/health` 返回应用 1.0.1、FFmpeg 9.1
- 便携版 `/api/selftest` 通过；上传 MP4、转换 WebM 完成
- 进程树：launcher 与内置 `node.exe` 同时存在；测试结束后可完整终止
- 包内不含本机说明、`server.json`、上传文件或任务记录

## 复现

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-deps.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

或直接：

```powershell
.\Start.bat
```

然后访问 `http://127.0.0.1:4318`。

## 说明

- 测试素材由 FFmpeg 合成，不包含任何用户私密媒体。
- 硬件加速测试只验证编译支持；实际可用性取决于显卡、驱动和会话。
- 性能数字来自上述测试机，不代表所有设备。
