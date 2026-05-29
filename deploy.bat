@echo off
title WishBridge Deploy

echo ========================================
echo   WishBridge Deploy Tool
echo ========================================
echo.

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

REM Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found, please install Node.js first
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js: %NODE_VER%

REM Check npm
echo [2/5] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] npm: %NPM_VER%

REM Check backend dependencies
echo [3/5] Checking backend dependencies...
if not exist "%BACKEND_DIR%\node_modules" (
    echo Installing backend dependencies...
    cd /d "%BACKEND_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies exist
)

REM Check frontend dependencies
echo [4/5] Checking frontend dependencies...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies exist
)

REM Check and free port 8080
echo [5/5] Checking port 8080...
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
        echo Found port 8080 in use by process %%a, stopping it...
        taskkill /F /PID %%a >nul 2>&1
        timeout /t 1 /nobreak >nul
    )
    echo [OK] Port 8080 freed
)

echo.
echo ========================================
echo   Starting Services
echo ========================================
echo.

REM Create temporary start scripts
echo @echo off > "%TEMP%\start_backend.bat"
echo cd /d "%BACKEND_DIR%" >> "%TEMP%\start_backend.bat"
echo npm start >> "%TEMP%\start_backend.bat"

echo @echo off > "%TEMP%\start_frontend.bat"
echo cd /d "%FRONTEND_DIR%" >> "%TEMP%\start_frontend.bat"
echo npm run dev >> "%TEMP%\start_frontend.bat"

echo Starting backend service...
start "WishBridge Backend" cmd /k ""%TEMP%\start_backend.bat""

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend service...
start "WishBridge Frontend" cmd /k ""%TEMP%\start_frontend.bat""

echo.
echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: Check frontend window
echo.
echo Services started in new windows!
echo Close windows to stop services.
echo.
pause
