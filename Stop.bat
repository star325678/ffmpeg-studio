@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-server.ps1"
ping -n 2 127.0.0.1 >nul
exit /b 0
