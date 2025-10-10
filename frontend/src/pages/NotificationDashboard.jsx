import { useState, useEffect, useCallback } from "react";
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

/* ============ Custom Debounce ============ */
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "80vh", borderRadius: "10px" };
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function NotificationDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [statusFilter, setStatusFilter] = useState("All");
  const [inMyArea, setInMyArea] = useState(false);
  const [radius, setRadius] = useState(20);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [responder, setResponder] = useState(
    JSON.parse(localStorage.getItem("responder"))
  );

  const [allResponders, setAllResponders] = useState([]);
  const [filteredResponders, setFilteredResponders] = useState([]);
  const [responderToAssign, setResponderToAssign] = useState("");
  const [responderSearch, setResponderSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [editForm, setEditForm] = useState({
    name: responder?.name || "",
    email: responder?.email || "",
    contactNumber: responder?.contactNumber || "",
    address: responder?.address || "",
    position: responder?.position || "",
  });

  /* ======================= Live Location Update (Every 1s) ======================= */
  useEffect(() => {
    if (!responder?._id) return;

    let geoWatchId;

    const activateResponder = async () => {
      try {
        await axios.put(`http://localhost:3000/api/responders/${responder._id}/status`, {
          status: "active",
        });
      } catch (err) {
        console.error("Failed to activate responder:", err);
      }
    };

    const updateLocation = async (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      try {
        await axios.put(`http://localhost:3000/api/responders/${responder._id}/location`, {
          lat: latitude,
          lng: longitude,
        });
      } catch (err) {
        console.error("Failed to update live location:", err);
      }
    };

    const startTracking = () => {
      if (navigator.geolocation) {
        geoWatchId = navigator.geolocation.watchPosition(
          updateLocation,
          (err) => console.error(err),
          { enableHighAccuracy: true, maximumAge: 500 }
        );
      }
    };

    activateResponder();
    startTracking();

    // Deactivate responder on unload
    const handleBeforeUnload = async () => {
      try {
        await axios.put(`http://localhost:3000/api/responders/${responder._id}/status`, {
          status: "inactive",
        });
      } catch (err) {
        console.error("Failed to deactivate responder:", err);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (geoWatchId) navigator.geolocation.clearWatch(geoWatchId);
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [responder]);

  /* ======================= Fetch Alerts ======================= */
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      if (!responder?.NIC) return;
      const res = await axios.get(
        `http://localhost:3000/api/alerts/assigned/${responder.NIC}`
      );
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching assigned alerts:", err);
      toast.error("Failed to fetch assigned alerts.");
    }
  };

  /* ======================= Fetch Responders ======================= */
  useEffect(() => {
    fetchResponders();
  }, []);

  const fetchResponders = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/responders");
      setAllResponders(res.data);
    } catch (err) {
      console.error("Failed to fetch responders", err);
      toast.error("Failed to fetch responders");
    }
  };

  /* ======================= Filters ======================= */
  useEffect(() => {
    applyFilter();
  }, [alerts, statusFilter, inMyArea, userLocation, radius]);

  const applyFilter = () => {
    let tempAlerts = [...alerts];

    if (statusFilter !== "All") {
      tempAlerts = tempAlerts.filter(
        (a) => a.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (inMyArea) {
      tempAlerts = tempAlerts.filter((alert) => {
        if (!alert.liveLocation?.coordinates) return false;
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          alert.liveLocation.coordinates[1],
          alert.liveLocation.coordinates[0]
        );
        return distance <= radius;
      });
    }

    setFilteredAlerts(tempAlerts);
  };

  useEffect(() => {
    filterResponders();
  }, [allResponders, responderSearch, positionFilter, selectedAlert]);

  const filterResponders = useCallback(
    debounce(() => {
      if (!selectedAlert) return setFilteredResponders([]);
      const alertCoords = selectedAlert.liveLocation?.coordinates || [0, 0];

      let temp = allResponders.filter((r) => {
        if (r.status !== "active") return false;
        if (positionFilter && r.position !== positionFilter) return false;

        if (r.liveLocation?.lat && r.liveLocation?.lng) {
          const distance = getDistanceFromLatLonInKm(
            alertCoords[1],
            alertCoords[0],
            r.liveLocation.lat,
            r.liveLocation.lng
          );
          if (distance > 10) return false;
        }

        const query = responderSearch.toLowerCase();
        if (query && !(r.name.toLowerCase().includes(query) || r.email.toLowerCase().includes(query))) return false;

        return true;
      });

      setFilteredResponders(temp);
    }, 300),
    [allResponders, responderSearch, positionFilter, selectedAlert]
  );

  /* ======================= Actions ======================= */
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

  const handleAssignResponder = async (alertId) => {
    if (!responderToAssign) return toast.warning("Select a responder first");

    try {
      await axios.put(`http://localhost:3000/api/alerts/${alertId}/assign`, {
        responderId: responderToAssign,
        append: true, // ✅ append mode
      });
      toast.success("Responder assigned successfully!");
      fetchAlerts();
      setResponderToAssign("");
      setResponderSearch("");
      setPositionFilter("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign responder");
    }
  };

  /* ======================= Helpers ======================= */
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-red-500 text-white";
      case "accepted": return "bg-yellow-400 text-black";
      case "resolved":
      case "completed": return "bg-green-800 text-white";
      case "cancelled": return "bg-gray-500 text-white";
      default: return "bg-gray-200";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("responder");
    toast.info("Logged out");
    navigate("/login");
  };

  const handleProfileChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleProfileSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/responders/${responder._id}`,
        editForm
      );
      setResponder(res.data.responder);
      localStorage.setItem("responder", JSON.stringify(res.data.responder));
      toast.success("Profile updated!");
      setShowEditProfile(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="relative bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-primary">
          🚨 Emergency Responder Dashboard
        </h1>

        <div className="flex items-center space-x-4 flex-wrap gap-2">
          {/* Status Filter */}
          <select
            className="p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Alerts</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Area Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={inMyArea}
              onChange={() => setInMyArea(!inMyArea)}
              className="w-5 h-5"
            />
            <label>In My Area</label>
            {inMyArea && (
              <input
                type="number"
                className="p-1 border rounded w-16"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                placeholder="km"
              />
            )}
          </div>

          {/* Profile + Logout */}
          {responder && (
            <div className="relative group">
              <button className="bg-indigo-600 text-white py-2 px-4 rounded shadow">
                {responder.name} ⬇
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg p-4 hidden group-hover:block z-50">
                <h3 className="text-lg font-bold mb-2">{responder.name}</h3>
                <p><strong>Email:</strong> {responder.email}</p>
                <p><strong>NIC:</strong> {responder.NIC}</p>
                <p><strong>Type:</strong> {responder.responderType}</p>
                <p><strong>Position:</strong> {responder.position}</p>
                <p><strong>Status:</strong> {responder.status}</p>
                <div className="mt-3 flex flex-col space-y-2">
                  <button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded"
                    onClick={() => setShowEditProfile(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

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

        {/* RIGHT: Map */}
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

            {inMyArea && (
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

                  {selectedAlert.status === "pending" && (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mt-2 w-full"
                      onClick={() => handleAccept(selectedAlert)}
                    >
                      Accept
                    </button>
                  )}

                  {/* Assign Extra Responder */}
                  <div className="mt-2 border-t pt-2">
                    <input
                      type="text"
                      placeholder="Search responder..."
                      className="border rounded p-1 w-full mb-1"
                      value={responderSearch}
                      onChange={(e) => setResponderSearch(e.target.value)}
                    />
                    <select
                      className="border rounded p-1 w-full mb-1"
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                    >
                      <option value="">All Positions</option>
                      {Array.from(new Set(allResponders.map((r) => r.position))).map(
                        (pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="border rounded p-1 w-full mb-1"
                      value={responderToAssign}
                      onChange={(e) => setResponderToAssign(e.target.value)}
                    >
                      <option value="">Select Responder</option>
                      {filteredResponders.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.position})
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mt-1 w-full"
                      onClick={() => handleAssignResponder(selectedAlert._id)}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editForm.name}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editForm.email}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={editForm.contactNumber}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editForm.address}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={editForm.position}
                onChange={handleProfileChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleProfileSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
