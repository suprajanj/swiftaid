// src/AcceptedTasks.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import mapStyles from "./mapStyles.jsx"; // ✅ Fixed import
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
  const [responderLocation, setResponderLocation] = useState([defaultCenter.lat, defaultCenter.lng]);
  const navigate = useNavigate();

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch accepted alerts
  const fetchAcceptedAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted");
      setAcceptedAlerts(res.data);
    } catch (err) {
      console.error("Error fetching accepted alerts:", err);
    }
  };

  // Get responder location
  const getResponderLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setResponderLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Location denied:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    fetchAcceptedAlerts();
    getResponderLocation();
    const interval = setInterval(() => {
      fetchAcceptedAlerts();
      getResponderLocation();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loadError) return <p className="text-red-500">Error loading maps</p>;
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
        {acceptedAlerts.length === 0 && <p className="text-gray-500">No active accepted alerts</p>}
        <ul className="space-y-3">
          {acceptedAlerts.map((alert) => (
            <li
              key={alert.reportId}
              className={`border p-3 rounded-lg cursor-pointer hover:bg-blue-50 ${
                selectedAlert?.reportId === alert.reportId ? "border-blue-400 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <p className="font-semibold">{alert.emergencyType.toUpperCase()}</p>
              <p className="text-sm text-gray-600">{alert.address}</p>
              <p className="text-xs mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 inline-block rounded">
                {alert.status}
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
              : { lat: responderLocation[0], lng: responderLocation[1] }
          }
          zoom={selectedAlert ? 14 : 8}
          options={{ styles: mapStyles }}
        >
          {/* Responder location marker */}
          <MarkerF
            position={{ lat: responderLocation[0], lng: responderLocation[1] }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                  <text x="0" y="30" font-size="30">🦺</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(40, 40),
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
              <p><span className="font-semibold">Report ID:</span> {selectedAlert.reportId}</p>
              <p><span className="font-semibold">User ID:</span> {selectedAlert.userId}</p>
              <p><span className="font-semibold">NIC:</span> {selectedAlert.NIC}</p>
              <p><span className="font-semibold">Contact:</span> {selectedAlert.contactNumber}</p>
              <p><span className="font-semibold">Type:</span> {selectedAlert.emergencyType}</p>
              <p><span className="font-semibold">Address:</span> {selectedAlert.address}</p>
              <p><span className="font-semibold">Time:</span> {new Date(selectedAlert.timestamp).toLocaleString()}</p>
              <p><span className="font-semibold">Status:</span> {selectedAlert.status}</p>
              <p><span className="font-semibold">Priority:</span> {selectedAlert.priorityLevel}</p>
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
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

export default function AcceptedTasks() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [responderLocation, setResponderLocation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const responderIcon = new L.DivIcon({
    className: "responder-icon",
    html: "🏘",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  const fetchAcceptedAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted");
      setAlerts(res.data);
    } catch (error) {
      console.error("Failed to fetch accepted alerts", error);
    }
  };

  const getResponderLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setResponderLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Location access denied:", err),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchAcceptedAlerts();
    getResponderLocation();
    const interval = setInterval(() => setRefreshKey((prev) => prev + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAcceptedAlerts();
    getResponderLocation();
  }, [refreshKey]);

  const cancelAlert = async (alertId) => {
    if (!window.confirm("Are you sure you want to cancel this alert?")) return;
    try {
      await axios.put(`http://localhost:3000/api/alerts/cancel/${alertId}`);
      fetchAcceptedAlerts();
    } catch (err) {
      console.error("Failed to cancel alert:", err);
    }
  };

  const completeAlert = async () => {
    if (!selectedAlert) return;
    try {
      const formData = new FormData();
      formData.append("reportId", selectedAlert.reportId);
      photos.forEach((p) => formData.append("photos", p));
      videos.forEach((v) => formData.append("videos", v));

      await axios.put("http://localhost:3000/api/alerts/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedAlert(null);
      setPhotos([]);
      setVideos([]);
      fetchAcceptedAlerts();
    } catch (err) {
      console.error("Failed to complete alert:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4">
      <div className="w-full md:w-2/3 h-[500px]">
        <MapContainer
          center={responderLocation || [7.8731, 80.7718]}
          zoom={8}
          className="h-full rounded-2xl shadow-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {responderLocation && (
            <Marker position={responderLocation} icon={responderIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {alerts.map((alert) => (
            <Marker
              key={alert.reportId}
              position={[alert.liveLocation.coordinates[1], alert.liveLocation.coordinates[0]]}
            >
              <Popup>
                <strong>{alert.emergencyType.toUpperCase()}</strong>
                <br />
                {alert.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="w-full md:w-1/3 bg-white p-4 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-2">Accepted Alerts</h2>
        {alerts.length === 0 && <p className="text-gray-500">No active alerts</p>}
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.reportId} className="border p-3 rounded-lg">
              <p className="font-semibold">{alert.emergencyType}</p>
              <p className="text-sm text-gray-600">{alert.address}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => cancelAlert(alert.reportId)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                >
                  Complete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {selectedAlert && (
          <div className="mt-4 border-t pt-3">
            <h3 className="text-lg font-bold mb-2">Complete Task</h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(Array.from(e.target.files))}
              className="block w-full mb-2"
            />
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => setVideos(Array.from(e.target.files))}
              className="block w-full mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={completeAlert}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
              >
                Submit Completion
              </button>
              <button
                onClick={() => setSelectedAlert(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
