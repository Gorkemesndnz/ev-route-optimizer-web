@echo off
echo ==============================================
echo IYONTREE YONETIM PANELI - SUNUCU BASLATICI
echo ==============================================

echo Eski sunucu durumlari temizleniyor...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM uvicorn.exe /T >nul 2>&1

echo [1/2] Ev-Route-Optimizer-Api (Backend) baslatiliyor...
cd /d C:\Ev-Route-Optimizer-Api
:: Backend'i kendi penceresinde calistir (.venv klasoru kullanilarak 8001 portunda)
start "EV Backend (Python API)" cmd /k "call .venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"

echo [2/2] Ev_Route_Optimizer_Web (Frontend) baslatiliyor...
cd /d C:\Ev_Route_Optimizer_Web
:: Frontend'i kendi penceresinde calistir
start "EV Frontend (React Web)" cmd /k "npm run dev"

echo ==============================================
echo Her iki sunucu da ayri pencerelerde baslatildi!
echo Saniyelik yukleme sonrasinda tarayicinizdan 
echo http://localhost:5173 adresine erisebilirsiniz.
echo ==============================================
pause
