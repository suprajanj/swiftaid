import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718,
};

function SOSMap() {
  const [sosList, setSosList] = useState([]);

  // Load Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_API_KEY", // 🔑 Replace with your Google Maps API key
  });

  // Fetch SOS data from backend
  useEffect(() => {
    fetch("http://localhost:3000/api/sos") // Adjust if your backend runs on a different port
      .then((res) => res.json())
      .then((data) => setSosList(data))
      .catch((err) => console.error("Error fetching SOS:", err));
  }, []);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={7}>
      {sosList.map((sos) =>
        sos.location?.latitude && sos.location?.longitude ? (
          <Marker
            key={sos._id}
            position={{
              lat: sos.location.latitude,
              lng: sos.location.longitude,
            }}
            title={`${sos.name} (${sos.number})`}
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${sos.location.latitude},${sos.location.longitude}`,
                "_blank"
              )
            }
          />
        ) : null
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
}

export default SOSMap;
