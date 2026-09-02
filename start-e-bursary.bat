@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%E-bursary-backend"
set "FRONTEND=%ROOT%E-bursary-frontend"

echo Starting E-Bursary backend...
pushd "%BACKEND%"
start "E-Bursary Backend" cmd /k "npm.cmd run start:dev"
popd

echo Starting E-Bursary frontend...
pushd "%FRONTEND%"
start "E-Bursary Frontend" cmd /k "npm.cmd run start"
popd

echo Waiting for the app to start...
timeout /t 12 >nul
start "" http://localhost:4400
echo Opened http://localhost:4400
pause
