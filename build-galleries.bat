@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-galleries.ps1"
echo.
pause
