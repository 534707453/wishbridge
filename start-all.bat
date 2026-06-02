@echo off
title WishBridge Launcher

echo ========================================
echo    WishBridge - One Click Launcher
echo ========================================
echo.

cd /d "%~dp0"

REM [1/6] Check frontend env
if not exist "frontend\.env" (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://jp-2.frp.one:35661 > frontend\.env
    echo VITE_SOCKET_URL=http://jp-2.frp.one:35661 >> frontend\.env
) else (
    echo Frontend .env already exists
)

echo.
echo [2/6] Backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo Backend dependencies OK
)

echo.
echo [3/6] Frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo Frontend dependencies OK
)

echo.
echo [4/6] Starting backend
cd backend
start "WishBridge-Backend" cmd /k "node src\index.js"
cd ..
ping -n 5 127.0.0.1 >nul 2>&1

echo.
echo [5/6] Starting FRP tunnel
cd ChmlFrp-0.51.2_251023_2_windows_amd64
if exist frpc.exe (
    start "WishBridge-FRP" cmd /k "frpc.exe -c ..\frpc.ini"
    echo FRP tunnel started
) else (
    echo WARNING: frpc.exe not found
)
cd ..

echo.
echo [6/6] Starting frontend
cd frontend
start "WishBridge-Frontend" cmd /k "npm run dev"
cd ..
ping -n 8 127.0.0.1 >nul 2>&1

echo.
echo ========================================
echo.
echo   WishBridge Started Successfully!
echo.
echo   Access URL: http://jp-2.frp.one:35661
echo   Backend API: http://localhost:8080
echo.
echo   Keep windows open
echo   Press any key to open browser...
echo.
echo ========================================

pause >nul
start http://jp-2.frp.one:35661
