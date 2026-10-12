@echo off
setlocal
title CounterYield Android & Full-Stack Launcher

echo ==========================================================
echo   CounterYield - Launching Android Testing Environment
echo ==========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch_android.ps1" %*

pause
