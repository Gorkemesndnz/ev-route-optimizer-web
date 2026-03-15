import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import Hakkimizda from './pages/Hakkimizda.tsx'
import Iletisim from './pages/Iletisim.tsx'
import KullanimKosullari from './pages/KullanimKosullari.tsx'
import GizlilikPolitikasi from './pages/GizlilikPolitikasi.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/hakkimizda" element={<Hakkimizda />} />
        <Route path="/iletisim" element={<Iletisim />} />
        <Route path="/kullanim-kosullari" element={<KullanimKosullari />} />
        <Route path="/gizlilik" element={<GizlilikPolitikasi />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
