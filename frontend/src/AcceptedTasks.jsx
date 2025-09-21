// frontend/src/AcceptedTasks.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import mapStyles from "./mapStyles.jsx"; // Correct import
import { useNavigate } from "react-router-dom";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "80vh",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
};

const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Sri Lanka center

export default function AcceptedTasks() {
  const [acceptedAlerts, setAcceptedAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [responderLocation, setResponderLocation] = useState(defaultCenter);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Fetch accepted alerts
  const fetchAcceptedAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted", {
        timeout: 5000,
      });
      if (Array.isArray(res.data)) {
        setAcceptedAlerts(res.data);
        setError(null);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching accepted alerts:", err.message);
      setError("Failed to fetch alerts. Please try again.");
    }
  };

  // Get responder location
  const getResponderLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setResponderLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          console.error("Location denied:", err);
          setError("Unable to access location. Using default location.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // Fetch alerts and location
  useEffect(() => {
    fetchAcceptedAlerts();
    getResponderLocation();
    const interval = setInterval(() => {
      fetchAcceptedAlerts();
      getResponderLocation();
    }, 10000); // 10-second polling
    return () => clearInterval(interval);
  }, []);

  if (loadError) return <p className="text-red-500">Error loading maps: {loadError.message}</p>;
  if (!isLoaded) return <p className="text-blue-500">Loading Maps...</p>;

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* LEFT PANEL: Alerts List */}
      <div className="w-full md:w-1/3 bg-white p-4 rounded-2xl shadow-lg max-h-[80vh] overflow-y-auto">
        <button
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded mb-4 w-full"
          onClick={() => navigate("/")}
        >
          ⬅ Back to Dashboard
        </button>

        <h2 className="text-xl font-bold mb-3">Accepted Alerts</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {acceptedAlerts.length === 0 && !error && (
          <p className="text-gray-500">No active accepted alerts</p>
        )}
        <ul className="space-y-3">
          {acceptedAlerts.map((alert) => (
            <li
              key={alert.reportId}
              className={`border p-3 rounded-lg cursor-pointer hover:bg-blue-50 ${
                selectedAlert?.reportId === alert.reportId ? "border-blue-400 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <p className="font-semibold">{alert.emergencyType?.toUpperCase() || "Unknown"}</p>
              <p className="text-sm text-gray-600">{alert.address || "No address provided"}</p>
              <p className="text-xs mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 inline-block rounded">
                {alert.status || "Unknown"}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT PANEL: Google Map */}
      <div className="w-full md:w-2/3 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={
            selectedAlert?.liveLocation?.coordinates
              ? {
                  lat: selectedAlert.liveLocation.coordinates[1],
                  lng: selectedAlert.liveLocation.coordinates[0],
                }
              : responderLocation
          }
          zoom={selectedAlert ? 14 : 8}
          options={{ styles: mapStyles }}
        >
          {/* Responder location marker */}
          <MarkerF
            position={responderLocation}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                  <text x="0" y="30" font-size="30">🦺</text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />

          {/* Accepted alerts markers */}
          {acceptedAlerts.map(
            (alert) =>
              alert.liveLocation?.coordinates && (
                <MarkerF
                  key={alert.reportId}
                  position={{
                    lat: alert.liveLocation.coordinates[1],
                    lng: alert.liveLocation.coordinates[0],
                  }}
                  onClick={() => setSelectedAlert(alert)}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                  }}
                />
              )
          )}
        </GoogleMap>

        {/* Selected alert details */}
        {selectedAlert && (
          <div className="absolute top-4 right-4 w-80 bg-white shadow-2xl rounded-2xl p-4 border border-blue-100 z-50">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">🚨 Alert Details</h2>
              <button className="text-gray-500" onClick={() => setSelectedAlert(null)}>
                ❌
              </button>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Report ID:</span> {selectedAlert.reportId || "N/A"}</p>
              <p><span className="font-semibold">User ID:</span> {selectedAlert.userId || "N/A"}</p>
              <p><span className="font-semibold">NIC:</span> {selectedAlert.NIC || "N/A"}</p>
              <p><span className="font-semibold">Contact:</span> {selectedAlert.contactNumber || "N/A"}</p>
              <p><span className="font-semibold">Type:</span> {selectedAlert.emergencyType || "N/A"}</p>
              <p><span className="font-semibold">Address:</span> {selectedAlert.address || "N/A"}</p>
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {selectedAlert.timestamp
                  ? new Date(selectedAlert.timestamp).toLocaleString()
                  : "N/A"}
              </p>
              <p><span className="font-semibold">Status:</span> {selectedAlert.status || "N/A"}</p>
              <p>
                <span className="font-semibold">Priority:</span>{" "}
                {selectedAlert.priorityLevel || "N/A"}
              </p>
              {selectedAlert.liveLocation?.link && (
                <a
                  href={selectedAlert.liveLocation.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Live Location
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}