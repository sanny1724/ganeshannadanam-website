@echo off
cd /d "%~dp0"
title AI Desktop Assistant Daemon

echo ========================================================
echo   AI DESKTOP ASSISTANT - LOCAL LAPTOP AUTO-START
echo ========================================================
echo Starting Backend Engine and Dashboard...

:: Start the combined concurrent runner
npm run dev
