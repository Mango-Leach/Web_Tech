@echo off
REM VoltCalc Jet Launcher Script for Windows
pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1"
popd
pause
