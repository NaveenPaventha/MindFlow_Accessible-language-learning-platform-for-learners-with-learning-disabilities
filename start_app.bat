@echo off
echo Starting Accessible Language Learning Platform...
cd /d "%~dp0"
start cmd /k "cd backend && npm run dev"
start cmd /k "npm run dev"
echo Waiting for servers to start...
timeout /t 4 /nobreak > nul
start http://localhost:5173
exit