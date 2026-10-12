@echo off
setlocal
title CounterYield Desktop Browser Launcher

echo ==========================================================
echo   CounterYield - Launching Desktop Browser Environment
echo ==========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch_browser.ps1" %*

pause
