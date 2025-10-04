import { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  CircleF,
  useLoadScript,
} from "@react-google-maps/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mapStyles from "./mapStyles.jsx";
import { useNavigate } from "react-router-dom";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "80vh", borderRadius: "10px" };
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function NotificationDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [filter, setFilter] = useState("All");
  const [radius, setRadius] = useState(20);

  const navigate = useNavigate();

  // ✅ Get responder info from localStorage
  const responder = JSON.parse(localStorage.getItem("responder"));

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchAlerts();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilter();
  }, [alerts, filter, userLocation, radius]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts");
      setAlerts(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      toast.error("Failed to fetch alerts.");
    }
  };

  const applyFilter = () => {
    if (filter === "All") {
      setFilteredAlerts(alerts);
    } else if (filter === "In My Area") {
      setFilteredAlerts(
        alerts.filter((alert) => {
          if (!alert.liveLocation?.coordinates) return false;
          const distance = getDistanceFromLatLonInKm(
            userLocation.lat,
            userLocation.lng,
            alert.liveLocation.coordinates[1],
            alert.liveLocation.coordinates[0]
          );
          return distance <= radius;
        })
      );
    } else {
      setFilteredAlerts(
        alerts.filter((a) => a.status.toLowerCase() === filter.toLowerCase())
      );
    }
  };

  const handleAccept = async (alert) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${alert._id}/accept`);
      toast.success(`Alert ${alert.reportId} accepted!`);
      fetchAlerts();
      setSelectedAlert(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept alert.");
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-red-500 text-white";
      case "accepted":
        return "bg-yellow-400 text-black";
      case "resolved":
        return "bg-green-800 text-white";
      default:
        return "bg-gray-200";
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("responder");
    toast.info("Logged out");
    navigate("/login");
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="relative bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary">
          🚨 Emergency Responder Dashboard
        </h1>

        <div className="flex items-center space-x-4">
          {/* Filter Dropdown */}
          <select
            className="p-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Alerts</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* User Info Button */}
          {responder && (
            <div className="relative group">
              <button className="bg-indigo-600 text-white py-2 px-4 rounded shadow">
                {responder.name} ⬇
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg p-4 hidden group-hover:block">
                <p><strong>Name:</strong> {responder.name}</p>
                <p><strong>Email:</strong> {responder.email}</p>
                <p><strong>Type:</strong> {responder.responderType}</p>
                <button
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Accepted Tasks Button */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
            onClick={() => navigate("/accepted-tasks")}
          >
            Go to Accepted Tasks
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Alerts List */}
        <div className="col-span-3 bg-white shadow-xl rounded-2xl p-4 border max-h-[80vh] flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-primary">Alert List</h2>

          <div className="space-y-3 overflow-y-auto flex-1">
            {filteredAlerts.length === 0 && (
              <p className="text-gray-500 text-center mt-4">No alerts</p>
            )}

            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-xl border cursor-pointer hover:bg-blue-50 transition ${
                  selectedAlert?._id === alert._id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <h3 className="font-semibold">{alert.emergencyType.toUpperCase()}</h3>
                <p className="text-sm text-gray-600">{alert.address}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                    alert.status
                  )}`}
                >
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Map + Info */}
        <div className="col-span-9 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={12}
            options={{ styles: mapStyles }}
          >
            {/* User Marker */}
            <MarkerF
              position={userLocation}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="0" y="30" font-size="30">🦺</text></svg>`
                  ),
                scaledSize: new google.maps.Size(40, 40),
              }}
            />

            {filter === "In My Area" && (
              <CircleF
                center={userLocation}
                radius={radius * 1000}
                options={{
                  fillColor: "blue",
                  fillOpacity: 0.1,
                  strokeColor: "blue",
                  strokeOpacity: 0.5,
                  strokeWeight: 1,
                }}
              />
            )}

            {/* Alert Markers */}
            {filteredAlerts.map(
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
                        "data:image/svg+xml;charset=UTF-8," +
                        encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                            <text x="0" y="32" font-size="32">${
                              alert.status === "accepted"
                                ? "⌛"
                                : alert.status === "pending"
                                ? "📢"
                                : alert.status === "resolved"
                                ? "✅"
                                : "⚪"
                            }</text>
                          </svg>`
                        ),
                      scaledSize: new google.maps.Size(40, 40),
                    }}
                  />
                )
            )}

            {/* Info Window */}
            {selectedAlert?.liveLocation?.coordinates && (
              <InfoWindowF
                position={{
                  lat: selectedAlert.liveLocation.coordinates[1],
                  lng: selectedAlert.liveLocation.coordinates[0],
                }}
                onCloseClick={() => setSelectedAlert(null)}
              >
                <div className="text-sm">
                  <h3 className="font-bold text-blue-500 text-lg">
                    {selectedAlert.emergencyType}
                  </h3>
                  <p>{selectedAlert.address}</p>
                  <p>Status: {selectedAlert.status}</p>
                  <p>Report ID: {selectedAlert.reportId}</p>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                    onClick={() =>
                      selectedAlert.status === "pending"
                        ? handleAccept(selectedAlert)
                        : setSelectedAlert(null)
                    }
                  >
                    {selectedAlert.status === "pending"
                      ? "Accept"
                      : selectedAlert.status === "accepted"
                      ? "Cancel"
                      : "Close"}
                  </button>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
