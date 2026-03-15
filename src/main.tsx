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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketingProvider>
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
    </MarketingProvider>
  </StrictMode>,
)
