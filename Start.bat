@echo off
setlocal
cd /d "%~dp0"
if not exist "runtime\node.exe" (
  echo [FFmpeg Studio] runtime\node.exe is missing.
  echo Please extract the complete archive and try again.
  pause
  exit /b 1
)
if not exist "app\server.js" (
  echo [FFmpeg Studio] app\server.js is missing.
  pause
  exit /b 1
)
if not exist "ffmpeg\bin\ffmpeg.exe" (
  echo [FFmpeg Studio] ffmpeg\bin\ffmpeg.exe is missing.
  pause
  exit /b 1
)
start "FFmpeg Studio Server" /min "%~dp0runtime\node.exe" "%~dp0app\server.js" --open
exit /b 0
