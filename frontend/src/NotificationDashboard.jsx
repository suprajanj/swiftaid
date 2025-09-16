import { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";
import { Link } from "react-router-dom";
import mapStyles from "./mapStyles.jsx";


import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "80vh",
};
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function NotificationDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  if (loadError) return <p className="text-red-500">Error loading maps</p>;
  if (!isLoaded) return <p className="text-blue-500">Loading Maps...</p>;

  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-white min-h-screen">
      {/* LEFT: Notification List */}
      <div className="col-span-1 bg-white shadow-xl rounded-2xl p-4 border border-blue-100 overflow-y-auto max-h-[80vh] w-[100%]">
        <h2 className="text-xl font-bold text-primary mb-4">
          🚨 Active Notifications
        </h2>

        {alerts.length === 0 ? (
          <p className="text-gray-500">No active alerts</p>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[70vh]">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-xl border cursor-pointer hover:bg-blue-50 transition ${
                  selectedAlert?._id === alert._id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <h3 className="font-semibold text-primary">
                  {alert.emergencyType.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">{alert.address}</p>
                <span className="text-xs text-secondary font-medium">
                  Status: {alert.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Google Map */}
      <div className="col-span-2">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={{ styles: mapStyles }}
        >
          {alerts.map(
            (alert) =>
              alert.liveLocation?.coordinates && (
                <MarkerF
                  key={alert._id}
                  position={{
                    lat: alert.liveLocation.coordinates[1],
                    lng: alert.liveLocation.coordinates[0],
                  }}
                  onClick={() => setSelectedAlert(alert)}
                  icon={{
                    url:
                      selectedAlert?._id === alert._id
                        ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                />
              )
          )}

          {selectedAlert?.liveLocation?.coordinates && (
            <InfoWindowF
              position={{
                lat: selectedAlert.liveLocation.coordinates[1],
                lng: selectedAlert.liveLocation.coordinates[0],
              }}
              onCloseClick={() => setSelectedAlert(null)}
            >
              <div className="text-sm">
                <h3 className="font-bold text-primary">
                  {selectedAlert.emergencyType}
                </h3>
                <p>{selectedAlert.address}</p>
                <p className="text-blue-500 font-medium">
                  Status: {selectedAlert.status}
                </p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
