# ============================================================
# IYONTREE - Start All Services (API + Frontend)
# ============================================================
# Bu script tek komutla tum servisleri baslatir.
#
# Kullanim:
#   powershell -ExecutionPolicy Bypass -File .\start_all.ps1
#
# Servisler:
#   - Python API  : http://localhost:8000  (FastAPI + Uvicorn)
#   - .NET API    : http://localhost:5146  (ASP.NET Core)
#   - Frontend Web: http://localhost:5173  (Vite Dev Server)
# ============================================================

# --- Configuration ---
$ROOT_DIR = "C:\IYONTREE"
$API_DIR = "$ROOT_DIR\Ev-Route-Optimizer-Api"
$WEB_DIR = "$ROOT_DIR\Ev_Route_Optimizer_Web"
$DOTNET_BACKEND_DIR = "$ROOT_DIR\ev_route_optimizer_web_backend"

$services = @(
    @{ Name = "Python API (FastAPI)"; Port = 8000 },
    @{ Name = ".NET API";             Port = 5146 },
    @{ Name = "Frontend (Vite)";      Port = 5173 }
)

# --- Helper Functions ---
function Test-PortInUse {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

function Wait-ForPort {
    param([int]$Port, [string]$ServiceName, [int]$TimeoutSeconds = 30)
    Write-Host "      Bekleniyor: localhost:$Port " -NoNewline -ForegroundColor DarkGray
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("127.0.0.1", $Port)
            $tcp.Close()
            Write-Host " OK" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "." -NoNewline -ForegroundColor DarkGray
            Start-Sleep -Seconds 1
            $elapsed++
        }
    }
    Write-Host " TIMEOUT!" -ForegroundColor Red
    return $false
}

# --- Pre-flight: Check for port conflicts ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IYONTREE - Tum Servisler Baslatiliyor..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$hasConflict = $false
foreach ($svc in $services) {
    if (Test-PortInUse -Port $svc.Port) {
        Write-Host "  [UYARI] Port $($svc.Port) zaten kullaniliyor ($($svc.Name))" -ForegroundColor Red
        $hasConflict = $true
    }
}

if ($hasConflict) {
    Write-Host ""
    Write-Host "  Bazi portlar zaten kullaniliyor." -ForegroundColor Yellow
    Write-Host "  Devam etmek icin Y, iptal icin baska bir tus basin: " -NoNewline -ForegroundColor Yellow
    $answer = Read-Host
    if ($answer -ne "Y" -and $answer -ne "y") {
        Write-Host "  Iptal edildi." -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# --- 1. Python API (FastAPI + Uvicorn) ---
Write-Host "[1/3] Python API baslatiliyor..." -ForegroundColor Yellow
Write-Host "      Dizin : $API_DIR" -ForegroundColor DarkGray
Write-Host "      URL   : http://localhost:8000" -ForegroundColor DarkGray

$pythonProc = Start-Process powershell -PassThru -ArgumentList @(
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "Set-Location '$API_DIR'; & '$API_DIR\venv\Scripts\Activate.ps1'; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)

$apiReady = Wait-ForPort -Port 8000 -ServiceName "Python API" -TimeoutSeconds 15
if (-not $apiReady) {
    Write-Host "      [HATA] Python API baslatılamadi! Devam ediliyor..." -ForegroundColor Red
}
Write-Host ""

# --- 2. .NET Auth & Garage API ---
Write-Host "[2/3] .NET API hazirlaniyor..." -ForegroundColor Yellow
Write-Host "      Dizin : $DOTNET_BACKEND_DIR" -ForegroundColor DarkGray

# .env değişkenlerini yükle (ana proseste de olsun diye)
$envFile = "$DOTNET_BACKEND_DIR\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match "=" -and $_ -notmatch "^#" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
    }
}

# Veritabanı güncellemelerini çalıştır (bekleyerek)
Write-Host "      Veritabani semasi guncelleniyor..." -ForegroundColor DarkGray
Push-Location $DOTNET_BACKEND_DIR
dotnet ef database update --project "EvOptimizer.Net\src\EvOptimizer.Infrastructure" --startup-project "EvOptimizer.Net\src\EvOptimizer.Api"
Pop-Location

Write-Host "      .NET API baslatiliyor... (URL: http://localhost:5146)" -ForegroundColor DarkGray
$dotnetProc = Start-Process powershell -PassThru -ArgumentList @(
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "Set-Location '$DOTNET_BACKEND_DIR\EvOptimizer.Net\src\EvOptimizer.Api'; dotnet run"
)

$dotnetReady = Wait-ForPort -Port 5146 -ServiceName ".NET API" -TimeoutSeconds 30
if (-not $dotnetReady) {
    Write-Host "      [HATA] .NET API baslatılamadi! Devam ediliyor..." -ForegroundColor Red
}
Write-Host ""

# --- 3. Frontend Web (Vite Dev Server) ---
Write-Host "[3/3] Frontend Web baslatiliyor..." -ForegroundColor Yellow
Write-Host "      Dizin : $WEB_DIR" -ForegroundColor DarkGray
Write-Host "      URL   : http://localhost:5173" -ForegroundColor DarkGray

$frontendProc = Start-Process powershell -PassThru -ArgumentList @(
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "Set-Location '$WEB_DIR'; npm run dev"
)

$frontendReady = Wait-ForPort -Port 5173 -ServiceName "Frontend" -TimeoutSeconds 20
if (-not $frontendReady) {
    Write-Host "      [HATA] Frontend baslatılamadi!" -ForegroundColor Red
}
Write-Host ""

# --- Summary ---
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Servis Durumu:" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

$statusIcon = if ($apiReady) { "[OK]" } else { "[FAIL]" }
$statusColor = if ($apiReady) { "Green" } else { "Red" }
Write-Host "  $statusIcon Python API   : http://localhost:8000" -ForegroundColor $statusColor

$statusIcon = if ($dotnetReady) { "[OK]" } else { "[FAIL]" }
$statusColor = if ($dotnetReady) { "Green" } else { "Red" }
Write-Host "  $statusIcon .NET API     : http://localhost:5146" -ForegroundColor $statusColor

$statusIcon = if ($frontendReady) { "[OK]" } else { "[FAIL]" }
$statusColor = if ($frontendReady) { "Green" } else { "Red" }
Write-Host "  $statusIcon Frontend Web : http://localhost:5173" -ForegroundColor $statusColor

Write-Host ""
Write-Host "  Durdurmak icin acilan PowerShell pencerelerini kapatin." -ForegroundColor DarkGray
Write-Host ""
