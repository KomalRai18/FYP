@echo off
echo Starting TruthCheck AI Services...
echo.

echo Starting Python AI Service...
start "AI Service" cmd /k "cd /d %~dp0 && python ai_service.py"

echo Waiting for AI service to start...
timeout /t 5 /nobreak > nul

echo Starting Node.js Server...
start "Node.js Server" cmd /k "cd /d %~dp0 && npm run start:dev"

echo.
echo Services are starting...
echo - AI Service: http://localhost:5000
echo - Node.js Server: http://localhost:4000
echo.
echo Press any key to close this window...
pause > nul 