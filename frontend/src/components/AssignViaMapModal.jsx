// frontend/src/components/AssignViaMapModal.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function AssignViaMapModal({ isOpen, onClose, sos, onAssigned, isLoaded }) {
  const [responders, setResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && sos?.emergencyType) {
      fetchRespondersByType(sos.emergencyType);
    }
  }, [isOpen, sos]);

  const fetchRespondersByType = async (type) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/responders/by-type?type=${type}`
      );
      const validResponders = res.data.filter(
        (r) => r.lastLocation?.latitude && r.lastLocation?.longitude
      );
      setResponders(validResponders);
    } catch (err) {
      console.error("Error fetching responders:", err);
    }
  };

  const handleAssign = async (responderId) => {
    try {
      await axios.patch("http://localhost:4000/api/sos/assign", {
        sosId: sos._id,
        responderId,
      });
      onAssigned();
      onClose();
    } catch (err) {
      console.error("Error assigning responder:", err);
    }
  };

  if (!isOpen || !sos || !sos.location) return null;

  const toNumber = (value) => Number(value);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-3xl p-4 relative">
        <h2 className="text-xl font-semibold mb-4">
          Assign Responder for {sos.emergencyType} Emergency
        </h2>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: 7.8731, lng: 80.7718 }}
            zoom={7}
            onLoad={(map) => {
              mapRef.current = map;

              if (responders.length > 0 || sos.location) {
                const bounds = new window.google.maps.LatLngBounds();

                // Include SOS location
                bounds.extend({
                  lat: toNumber(sos.location.latitude),
                  lng: toNumber(sos.location.longitude),
                });

                // Include all responder locations (available & busy)
                responders.forEach((r) => {
                  bounds.extend({
                    lat: toNumber(r.lastLocation.latitude),
                    lng: toNumber(r.lastLocation.longitude),
                  });
                });

                map.fitBounds(bounds, 50);

                // Prevent over-zooming
                const listener = window.google.maps.event.addListener(map, "idle", function () {
                  if (map.getZoom() > 8) map.setZoom(8);
                  window.google.maps.event.removeListener(listener);
                });
              }
            }}
          >
            {/* SOS Marker */}
            <Marker
              position={{
                lat: toNumber(sos.location.latitude),
                lng: toNumber(sos.location.longitude),
              }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(50, 50),
              }}
              title={`${sos.name} — ${sos.emergencyType}`}
            />

            {/* Responder Markers */}
            {responders.map((responder) => (
              <Marker
                key={responder._id}
                position={{
                  lat: toNumber(responder.lastLocation.latitude),
                  lng: toNumber(responder.lastLocation.longitude),
                }}
                icon={{
                  url: responder.availability
                    ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"   // Available
                    : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Busy
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
                onClick={() => setSelectedResponder(responder)}
                title={`${responder.name} — ${responder.availability ? "Available" : "Busy"}`}
              />
            ))}

            {/* InfoWindow for selected responder */}
            {selectedResponder && selectedResponder.lastLocation && (
              <InfoWindow
                position={{
                  lat: toNumber(selectedResponder.lastLocation.latitude),
                  lng: toNumber(selectedResponder.lastLocation.longitude),
                }}
                onCloseClick={() => setSelectedResponder(null)}
              >
                <div>
                  <h3 className="font-semibold">{selectedResponder.name}</h3>
                  <p>Type: {selectedResponder.emergencyType}</p>
                  <p>Status: {selectedResponder.availability ? "Available" : "Busy"}</p>
                  {selectedResponder.availability && (
                    <button
                      onClick={() => handleAssign(selectedResponder._id)}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Assign
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <p>Loading map...</p>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-300 rounded px-2 py-1 hover:bg-gray-400"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
