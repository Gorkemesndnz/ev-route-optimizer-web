# ============================================================
# IYONTREE - Start All Services (API + Frontend)
# ============================================================
# Bu script tek komutla hem Backend API'yi hem Frontend'i başlatır.
#
# Kullanım:
#   powershell -ExecutionPolicy Bypass -File .\start_all.ps1
#
# Servisler:
#   - Backend API : http://localhost:8000  (FastAPI + Uvicorn)
#   - Frontend Web: http://localhost:5173  (Vite Dev Server)
# ============================================================

$API_DIR = "C:\Ev-Route-Optimizer-Api"
$WEB_DIR = "C:\Ev_Route_Optimizer_Web"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  IYONTREE - Tum Servisler Baslatiliyor..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Backend API (FastAPI + Uvicorn) ---
Write-Host "[1/2] Backend API baslatiliyor..." -ForegroundColor Yellow
Write-Host "      Dizin : $API_DIR" -ForegroundColor DarkGray
Write-Host "      URL   : http://localhost:8000" -ForegroundColor DarkGray
Write-Host ""

$apiProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$API_DIR'; & '$API_DIR\venv\Scripts\Activate.ps1'; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) -PassThru

Start-Sleep -Seconds 2

# --- 2. Frontend Web (Vite Dev Server) ---
Write-Host "[2/2] Frontend Web baslatiliyor..." -ForegroundColor Yellow
Write-Host "      Dizin : $WEB_DIR" -ForegroundColor DarkGray
Write-Host "      URL   : http://localhost:5173" -ForegroundColor DarkGray
Write-Host ""

$webProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$WEB_DIR'; npm run dev"
) -PassThru

Start-Sleep -Seconds 2

# --- Özet ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Tum servisler baslatildi!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API  : http://localhost:8000" -ForegroundColor White
Write-Host "  Swagger Docs : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Frontend Web : http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Durdurmak icin acilan PowerShell pencerelerini kapatin." -ForegroundColor DarkGray
Write-Host ""
