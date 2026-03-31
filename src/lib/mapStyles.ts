export const lightMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f8fafc" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#475569" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f8fafc" }]
  },
  // Ücretli/Özel Otobanlar -> Turkuaz (Hala marka rengimiz)
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#06b6d4" }]
  },
  // Devlet Otobanları -> Gümüş/Grit (Yeşil Tabelaların (E80 vb.) Öne Çıkması İçin)
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#cbd5e1" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#94a3b8" }]
  },
  // Ana Karayolları -> Parlak Turuncu
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#f97316" }]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#bae6fd" }]
  }
];

export const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#09090b" }] // Ana zemin rengi (Zinc-950)
  },
  {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }] // Restoran, hastane vb. kafa karıştıran PİN'leri KAPAT.
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f172a" }] // Orman/AVM gibi alanları karart.
  },
  {
    "featureType": "transit",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }] // Otobüs/Metro durak ikonlarını KAPAT.
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#64748b" }] // Şehir isimleri (Slate 500)
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#09090b" }, { "weight": 3 }] // Şehir isimleri etrafındaki kalın siyah kontür
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#1e293b" }] // Ana yollar (Slate 800)
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#09090b" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#334155" }] // Otobanlar 
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#475569" }] // Ücretli Otobanlar
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }] // Sadece yeşil otoban tabelaları (E80 vb) açık kalsın
  },
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#94a3b8" }] // Ülke/İlçe isimlerini bir tık daha belirgin yap
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f2e4a" }] // Deniz rengini belirginleştirecek kadar açtık (Deep Navy Blue)
  }
];
