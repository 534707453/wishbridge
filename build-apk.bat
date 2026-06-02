@echo off
REM 构建 WishBridge APK
echo [1/4] 初始化环境...
echo.

REM 设置 Java 路径
set JAVA_HOME=C:\Users\Negen\.jdks\jbr-17.0.14
set PATH=%JAVA_HOME%\bin;%PATH%

echo Java Home: %JAVA_HOME%
java -version

echo.
echo [2/4] 构建前端...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo 安装依赖...
    call npm install
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo 前端构建失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 同步到 Android 项目...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo 同步失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 构建 APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo APK 构建失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo APK 构建成功！
echo 输出位置:
echo %~dp0frontend\android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================

explorer.exe "%~dp0frontend\android\app\build\outputs\apk\debug"

pause
