@echo off
cd /d "%~dp0"
where python >nul 2>nul || (echo Python 3.12+ required & pause & exit /b 1)
where npm.cmd >nul 2>nul || (echo Node.js 20.19+ required & pause & exit /b 1)
python -m venv .venv
if errorlevel 1 goto failed
.venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 goto failed
call npm.cmd ci
if errorlevel 1 goto failed
call npm.cmd run build
if errorlevel 1 goto failed
echo Setup complete. Open Start RETROTUNE.cmd.
pause
exit /b 0
:failed
echo Setup failed. See output above.
pause
exit /b 1
