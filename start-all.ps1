# WishBridge 一键启动脚本 (PowerShell)
# 编码: UTF-8 with BOM

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$frpcPath = Join-Path $projectRoot "frpc.exe"
$frpcIniPath = Join-Path $projectRoot "frpc.ini"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WishBridge 情侣心愿应用 一键启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] 检查前端环境配置..." -ForegroundColor Yellow
Write-Host ""

$envFile = Join-Path $frontendPath ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "创建前端环境配置文件..." -ForegroundColor Gray
    @"
VITE_API_URL=http://jp-2.frp.one:35661
VITE_SOCKET_URL=http://jp-2.frp.one:35661
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "环境配置文件已创建" -ForegroundColor Green
} else {
    Write-Host "前端环境配置已存在" -ForegroundColor Green
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "jp-2\.frp\.one:35661") {
        Write-Host "  API地址已配置为内网穿透地址" -ForegroundColor Green
    } else {
        Write-Host "  警告: API地址可能未配置为内网穿透地址" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[2/6] 检查并安装后端依赖..." -ForegroundColor Yellow
Write-Host ""

$backendNodeModules = Join-Path $backendPath "node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Host "正在安装后端依赖..." -ForegroundColor Gray
    Push-Location $backendPath
    npm install
    Pop-Location
    Write-Host "后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "后端依赖已安装" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/6] 检查并安装前端依赖..." -ForegroundColor Yellow
Write-Host ""

$frontendNodeModules = Join-Path $frontendPath "node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "正在安装前端依赖..." -ForegroundColor Gray
    Push-Location $frontendPath
    npm install
    Pop-Location
    Write-Host "前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "前端依赖已安装" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/6] 启动后端服务 (端口 8080)..." -ForegroundColor Yellow
Write-Host ""

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    node src/index.js
} -ArgumentList $backendPath

Write-Host "后端服务启动中..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[5/6] 检查并启动内网穿透服务 (FRP)..." -ForegroundColor Yellow
Write-Host ""

$frpcInstalled = Get-Command frpc -ErrorAction SilentlyContinue

if (-not $frpcInstalled) {
    Write-Host "未检测到 FRP 客户端" -ForegroundColor Yellow
    Write-Host "请从以下地址下载 FRP:" -ForegroundColor Yellow
    Write-Host "  https://github.com/fatedier/frp/releases" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "下载后，将 frpc.exe 放到项目根目录" -ForegroundColor Yellow
    Write-Host ""

    if (Test-Path $frpcPath) {
        Write-Host "检测到项目根目录的 frpc.exe，正在启动..." -ForegroundColor Green
        $frpJob = Start-Job -ScriptBlock {
            param($exe, $ini)
            & $exe -c $ini
        } -ArgumentList $frpcPath, $frpcIniPath
    } else {
        Write-Host "跳过 FRP 启动，请手动启动穿透服务" -ForegroundColor Yellow
    }
} else {
    Write-Host "使用系统安装的 FRP 客户端" -ForegroundColor Green
    $frpJob = Start-Job -ScriptBlock {
        param($ini)
        frpc -c $ini
    } -ArgumentList $frpcIniPath
}

Write-Host ""
Write-Host "[6/6] 启动前端服务 (端口 5173)..." -ForegroundColor Yellow
Write-Host ""

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

Write-Host "前端服务启动中..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   WishBridge 启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "   访问地址: http://jp-2.frp.one:35661" -ForegroundColor White
Write-Host "   后端API:  http://localhost:8080" -ForegroundColor White
Write-Host "   前端Dev:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "   提示: 保持此 PowerShell 窗口打开" -ForegroundColor Gray
Write-Host "   关闭将停止所有服务" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$openBrowser = Read-Host "是否打开浏览器访问? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://jp-2.frp.one:35661"
}

Write-Host ""
Write-Host "服务状态监控 (Ctrl+C 退出):" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        $backendStatus = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendStatus) {
            Write-Host "[后端]" -ForegroundColor Green -NoNewline
            Write-Host " 运行中"
        }

        $frontendStatus = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendStatus -match "Local:") {
            Write-Host "[前端]" -ForegroundColor Green -NoNewline
            Write-Host " 运行中"
        }

        Start-Sleep -Seconds 10
    }
} finally {
    Write-Host ""
    Write-Host "正在停止所有服务..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob, $frpJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob, $frpJob -Force -ErrorAction SilentlyContinue
    Write-Host "服务已停止" -ForegroundColor Green
}
