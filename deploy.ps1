# WishBridge 一键部署脚本
# PowerShell 5.1+ 版本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🌉 WishBridge 一键部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# 检查Node.js是否安装
Write-Host "[1/5] 检查Node.js环境..." -ForegroundColor Yellow
try {
    $NodeVersion = node --version
    Write-Host "✅ Node.js已安装: $NodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js未安装，请先安装Node.js" -ForegroundColor Red
    exit 1
}

# 检查npm
Write-Host "[2/5] 检查npm..." -ForegroundColor Yellow
try {
    $NpmVersion = npm --version
    Write-Host "✅ npm已安装: $NpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm未找到" -ForegroundColor Red
    exit 1
}

# 检查并安装后端依赖
Write-Host "[3/5] 检查后端依赖..." -ForegroundColor Yellow
$BackendNodeModules = Join-Path $BackendDir "node_modules"
if (-not (Test-Path $BackendNodeModules)) {
    Write-Host "正在安装后端依赖..." -ForegroundColor Cyan
    Set-Location $BackendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 后端依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "✅ 后端依赖已存在" -ForegroundColor Green
}

# 检查并安装前端依赖
Write-Host "[4/5] 检查前端依赖..." -ForegroundColor Yellow
$FrontendNodeModules = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $FrontendNodeModules)) {
    Write-Host "正在安装前端依赖..." -ForegroundColor Cyan
    Set-Location $FrontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 前端依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "✅ 前端依赖已存在" -ForegroundColor Green
}

# 查找并终止占用8080端口的进程
Write-Host "[5/5] 检查端口占用..." -ForegroundColor Yellow
$Port8080 = netstat -ano | Select-String ":8080" | Select-String "LISTENING"
if ($Port8080) {
    $Pid = ($Port8080 -split '\s+')[-1]
    Write-Host "发现端口8080被进程 $Pid 占用，正在终止..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $Pid -Force
        Start-Sleep -Seconds 1
        Write-Host "✅ 已释放端口8080" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  无法终止进程，请手动关闭" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备启动服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 创建后端服务窗口
Write-Host "🚀 启动后端服务..." -ForegroundColor Cyan
$BackendJob = Start-Job -ScriptBlock {
    param($Dir)
    Set-Location $Dir
    npm start
} -ArgumentList $BackendDir

# 等待后端启动
Start-Sleep -Seconds 3

# 检查后端是否启动成功
$BackendRunning = $false
$MaxRetries = 5
$RetryCount = 0
while (-not $BackendRunning -and $RetryCount -lt $MaxRetries) {
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 2
        if ($Response.StatusCode -eq 200) {
            $BackendRunning = $true
        }
    } catch {
        Start-Sleep -Seconds 2
    }
    $RetryCount++
}

if (-not $BackendRunning) {
    Write-Host "❌ 后端服务启动失败" -ForegroundColor Red
    Receive-Job -Job $BackendJob
    Stop-Job -Job $BackendJob
    exit 1
}

Write-Host "✅ 后端服务启动成功: http://localhost:8080" -ForegroundColor Green

# 创建前端服务窗口
Write-Host "🚀 启动前端服务..." -ForegroundColor Cyan
$FrontendJob = Start-Job -ScriptBlock {
    param($Dir)
    Set-Location $Dir
    npm run dev
} -ArgumentList $FrontendDir

# 等待前端启动
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ WishBridge 部署成功" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 后端服务: http://localhost:8080" -ForegroundColor White
Write-Host "🌐 前端服务: 请查看下方输出" -ForegroundColor White
Write-Host ""
Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
Write-Host ""

# 持续输出前端日志
try {
    while ($true) {
        Receive-Job -Job $BackendJob
        Receive-Job -Job $FrontendJob
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "正在停止服务..." -ForegroundColor Yellow
    Stop-Job -Job $BackendJob
    Stop-Job -Job $FrontendJob
    Remove-Job -Job $BackendJob -Force
    Remove-Job -Job $FrontendJob -Force
    Write-Host "✅ 服务已停止" -ForegroundColor Green
}
