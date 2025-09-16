// src/mapStyles.jsx
const mapStyles = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }]
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e3a8a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e3a8a" }] } ,
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] }
];

export default mapStyles;
