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
    "stylers": [{ "color": "#020617" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#94a3b8" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#020617" }]
  },
  // Ücretli/Özel Otobanlar -> Turkuaz
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#06b6d4" }]
  },
  // Devlet Otobanları -> Parlak Gümüş / Beyaz (Yeşil E80 tabelalarının parlaması için)
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#cbd5e1" }]
  },
  // Ana Karayolları -> Parlak Turuncu
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#f97316" }]
  },
  // Ara Sokaklar -> Derin Lacivert (Zeminden bir tık açık)
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0c4a6e" }]
  }
];
