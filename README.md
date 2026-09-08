# EV Route Optimizer — Web

IYONTREE elektrikli araç rota ve şarj planlama sisteminin web arayüzü.
Kullanıcı rotayı ve aracı girer; arayüz optimizasyon motorundan dönen şarj duraklarını, SoC profilini ve süre/maliyet tahminlerini harita üzerinde gösterir.

> Sistemin diğer bileşenleri: [Ev-Route-Optimizer-Api](https://github.com/Gorkemesndnz/Ev-Route-Optimizer-Api) (FastAPI optimizasyon motoru) · [ev_route_optimizer_web_backend](https://github.com/Gorkemesndnz/ev_route_optimizer_web_backend) (.NET 8 backend)

## Özellikler

- Google Maps üzerinde rota ve şarj durağı görselleştirmesi
- Sürükle-bırak ile durak sıralama (dnd-kit)
- Araç seçimi ve başlangıç SoC girişi
- Optimizasyon sonucunun adım adım özeti (mesafe, süre, şarj süresi, tahmini maliyet)

## Teknolojiler

| Alan | Kullanılan |
| :--- | :--- |
| Framework | React 19 |
| Build | Vite 6 |
| Harita | @react-google-maps/api |
| Etkileşim | @dnd-kit (core / sortable / utilities) |

## Kurulum

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # üretim derlemesi
npm run preview  # derlenmiş çıktıyı önizle
```

### Ortam değişkenleri

Proje köküne `.env` dosyası oluşturun:

```
VITE_GOOGLE_MAPS_API_KEY=<google-maps-anahtariniz>
VITE_API_BASE_URL=http://localhost:5000
```

`.env` dosyasını sürüm kontrolüne eklemeyin.

## Proje Yapısı

```
src/
├── components/   # Arayüz bileşenleri
├── hooks/        # Özel React hook'ları
├── services/     # Backend API çağrıları
├── App.jsx
└── main.jsx
```
