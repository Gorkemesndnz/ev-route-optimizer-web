import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import Hakkimizda from './pages/Hakkimizda.tsx'
import Iletisim from './pages/Iletisim.tsx'
import KullanimKosullari from './pages/KullanimKosullari.tsx'
import GizlilikPolitikasi from './pages/GizlilikPolitikasi.tsx'
import Home from './pages/Home.tsx'
import { MarketingProvider } from './pages/BasePageLayout.tsx'

import { SettingsProvider } from './contexts/SettingsContext'
import { AuthProvider } from './contexts/AuthContext'
import { VehicleProvider } from './contexts/VehicleContext'
import { StationProvider } from './contexts/StationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketingProvider>
      <SettingsProvider>
        <AuthProvider>
          <VehicleProvider>
            <StationProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/home/hakkimizda" element={<Hakkimizda />} />
                  <Route path="/home/iletisim" element={<Iletisim />} />
                  <Route path="/home/kullanim-kosullari" element={<KullanimKosullari />} />
                  <Route path="/home/gizlilik" element={<GizlilikPolitikasi />} />
                </Routes>
              </BrowserRouter>
            </StationProvider>
          </VehicleProvider>
        </AuthProvider>
      </SettingsProvider>
    </MarketingProvider>
  </StrictMode>,
)
