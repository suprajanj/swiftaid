import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

/* ============ Constants ============ */
const API_BASE_URL = "http://127.0.0.1:3000/api";
axios.defaults.baseURL = API_BASE_URL;

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "80vh", borderRadius: "10px" };
const defaultCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo fallback

/* ============ Small helpers ============ */
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

const getStatusBadgeClasses = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "bg-red-100 text-red-700";
    case "accepted":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
    case "resolved":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-gray-200 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const makeSvgIconDataUrl = (text, bg = "transparent", size = 40) =>
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="${bg}" rx="8" ry="8"/>
      <text x="50%" y="55%" font-size="${Math.floor(size * 0.45)}" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`
  );

const markerIconForStatus = (status) => {
  const st = (status || "").toLowerCase();
  if (st === "accepted") return makeSvgIconDataUrl("⌛");
  if (st === "pending") return makeSvgIconDataUrl("📢");
  if (st === "completed" || st === "resolved") return makeSvgIconDataUrl("✅");
  if (st === "cancelled") return makeSvgIconDataUrl("⚪");
  return makeSvgIconDataUrl("📍");
};

/* ============ Component ============ */
export default function NotificationDashboard() {
  const navigate = useNavigate();

  /* ============ State ============ */
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [statusFilter, setStatusFilter] = useState("All");
  const [inMyArea, setInMyArea] = useState(false);
  const [radius, setRadius] = useState(20);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [responder, setResponder] = useState(
    JSON.parse(localStorage.getItem("responder")) || null
  );
  const [nearbyResponders, setNearbyResponders] = useState([]);
  const [responderToAssign, setResponderToAssign] = useState("");
  const [isLoadingResponders, setIsLoadingResponders] = useState(false);
  const [editForm, setEditForm] = useState({
    name: responder?.name || "",
    email: responder?.email || "",
    contactNumber: responder?.contactNumber || "",
    address: responder?.address || "",
    position: responder?.position || "",
  });

  const geoWatchIdRef = useRef(null);
  const mountedRef = useRef(true);
  const prevAlertsRef = useRef([]);

  /* ============ Google Maps loader ============ */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  /* ============ API helpers ============ */
  const safeApiGet = async (url, config = {}) => {
    try {
      const res = await axios.get(url, config);
      return res.data;
    } catch (err) {
      console.error(`GET ${url} failed:`, err?.response?.data || err.message);
      throw err;
    }
  };

  const safeApiPut = async (url, data = {}, config = {}) => {
    try {
      const res = await axios.put(url, data, config);
      return res.data;
    } catch (err) {
      console.error(`PUT ${url} failed:`, err?.response?.data || err.message);
      throw err;
    }
  };

  const safeApiPatch = async (url, data = {}, config = {}) => {
    try {
      const res = await axios.patch(url, data, config);
      return res.data;
    } catch (err) {
      console.error(`PATCH ${url} failed:`, err?.response?.data || err.message);
      throw err;
    }
  };

  /* ======================= Live Location Update ======================= */
  useEffect(() => {
    mountedRef.current = true;
    if (!responder?._id) return;

    const activateResponder = async () => {
      try {
        await safeApiPatch(`/responders/${responder._id}/status`, { status: "active" });
      } catch (err) {
        if (err?.response?.status === 404) {
          console.warn("Responder not found on backend.");
        } else {
          console.error("Failed to activate responder:", err);
        }
      }
    };

    const updateLocation = async (pos) => {
      if (!pos?.coords) return;
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      try {
        // Update responder's location using the general update endpoint
        await safeApiPut(`/responders/${responder._id}`, {
          lastLocation: {
            latitude: latitude,
            longitude: longitude,
            updatedAt: new Date()
          }
        });
      } catch (err) {
        // Silently fail to avoid spamming console
        if (err?.response?.status !== 404) {
          console.error("Failed to update live location:", err?.message);
        }
      }
    };

    const startTracking = () => {
      if (navigator.geolocation) {
        try {
          const id = navigator.geolocation.watchPosition(
            updateLocation,
            (err) => {
              console.error("Geolocation watchPosition error:", err);
            },
            { enableHighAccuracy: true, maximumAge: 500 }
          );
          geoWatchIdRef.current = id;
        } catch (err) {
          console.error("startTracking error:", err);
        }
      } else {
        console.warn("Geolocation not available in this browser.");
      }
    };

    const handleBeforeUnload = async () => {
      try {
        await safeApiPatch(`/responders/${responder._id}/status`, { status: "inactive" });
      } catch (err) {
        if (err?.response?.status !== 404) {
          console.error("Failed to deactivate responder on unload:", err);
        }
      }
    };

    activateResponder();
    startTracking();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      mountedRef.current = false;
      if (geoWatchIdRef.current !== null && navigator.geolocation?.clearWatch) {
        try {
          navigator.geolocation.clearWatch(geoWatchIdRef.current);
        } catch (err) {
          console.warn("Error clearing geolocation watch:", err);
        }
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Set responder to inactive on unmount
      if (responder?._id) {
        safeApiPatch(`/responders/${responder._id}/status`, { status: "inactive" }).catch(() => {});
      }
    };
  }, [responder]);

  /* ======================= Fetch Alerts ======================= */
  const fetchAlerts = useCallback(async () => {
    try {
      if (!responder?._id) return;
      const data = await safeApiGet(`/alerts/assigned/${responder._id}`);
      const arr = Array.isArray(data) ? data : data.data || [];
      const prevIds = new Set((prevAlertsRef.current || []).map((a) => a._id));
      const newAlerts = arr.filter((a) => !prevIds.has(a._id));
      if (newAlerts.length > 0) {
        newAlerts.forEach((a) => {
          toast.info(`New alert: ${a.emergency || a.emergencyType || "Emergency"}`, { autoClose: 4000 });
          if (window.Notification && Notification.permission === "granted") {
            new Notification("New Alert", { body: `${a.emergency || a.emergencyType} — ${a.address || "Location"}` });
          }
        });
      }
      prevAlertsRef.current = arr;
      setAlerts(arr);
    } catch (err) {
      console.error("Error fetching assigned alerts:", err);
      toast.error("Failed to fetch assigned alerts.");
    }
  }, [responder]);

  useEffect(() => {
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  /* ======================= Fetch Nearby Responders ======================= */
  const fetchNearbyResponders = useCallback(async (alertId) => {
    if (!alertId) {
      setNearbyResponders([]);
      return;
    }

    setIsLoadingResponders(true);
    try {
      const data = await safeApiGet(`/alerts/${alertId}/nearby-responders`);
      const responders = Array.isArray(data) ? data : [];
      console.log('Fetched nearby responders:', responders);
      setNearbyResponders(responders);
      
      if (responders.length === 0) {
        toast.info("No active responders found nearby (within 10km, same position)");
      }
    } catch (err) {
      console.error("Failed to fetch nearby responders:", err);
      const errorMsg = err?.response?.data?.message || "Failed to fetch nearby responders";
      toast.error(errorMsg);
      setNearbyResponders([]);
    } finally {
      setIsLoadingResponders(false);
    }
  }, []);

  /* ======================= Filters (apply) ======================= */
  useEffect(() => {
    applyFilter();
  }, [alerts, statusFilter, inMyArea, userLocation, radius]);

  const applyFilter = useCallback(() => {
    let tempAlerts = [...alerts];

    if (statusFilter !== "All") {
      tempAlerts = tempAlerts.filter((a) => (a.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (inMyArea) {
      tempAlerts = tempAlerts.filter((alert) => {
        if (!alert.location?.latitude || !alert.location?.longitude) return false;
        const lat = alert.location.latitude;
        const lng = alert.location.longitude;
        const distance = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, lat, lng);
        return distance <= radius;
      });
    }

    setFilteredAlerts(tempAlerts);
  }, [alerts, inMyArea, radius, statusFilter, userLocation]);

  const handleAccept = async (alert) => {
  if (!responder?._id) {
    toast.error("No responder logged in!");
    return;
  }

  try {
    console.log("Accepting alert:", alert._id, "with responder:", responder._id);

    // Send taskId (alert._id) and responderId
    const response = await safeApiPut(`/alerts/${alert._id}/accept`, {
      taskId: alert._id,
      responderId: responder._id,
    });

    if (response.alreadyAccepted) {
      toast.info("Alert already accepted!");
    } else {
      toast.success(`Alert ${alert.reportId || alert._id} accepted!`);
    }

    // Refresh alerts
    fetchAlerts();
    setSelectedAlert(null);
  } catch (err) {
    console.error("Accept error:", err);

    if (err?.response?.status === 404) {
      toast.error("Alert not found. It may have been deleted or processed.");
    } else if (err?.response?.status === 400) {
      toast.error(err?.response?.data?.message || "Invalid request. Check your data.");
    } else {
      toast.error("Failed to accept alert. Try again.");
    }
  }
};

  const handleAssignNewResponder = async () => {
    if (!responderToAssign) {
      toast.error("Please select a responder!");
      return;
    }
    if (!selectedAlert) {
      toast.error("No alert selected!");
      return;
    }

    try {
      await safeApiPut(`/alerts/${selectedAlert._id}/assign`, { 
        responderId: responderToAssign 
      });
      toast.success("Responder assigned successfully!");
      setResponderToAssign("");
      fetchAlerts();
      setSelectedAlert(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign responder.");
    }
  };

  /* ======================= Profile actions ======================= */
  const handleLogout = async () => {
    // Clear localStorage immediately
    localStorage.removeItem("responder");
    setResponder(null);
    
    // Try to deactivate responder status (don't wait for it)
    if (responder?._id) {
      safeApiPatch(`/responders/${responder._id}/status`, { status: "inactive" }).catch(() => {});
    }
    
    // Show toast
    toast.info("Logged out successfully", { autoClose: 1000 });
    
    // Force navigation - try both methods for maximum compatibility
    try {
      navigate("/login", { replace: true });
    } catch (err) {
      // If navigate fails, force reload to login page
      window.location.href = "/login";
    }
  };

  const handleProfileChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleProfileSave = async () => {
    try {
      const res = await safeApiPut(`/responders/${responder._id}`, editForm);
      const updatedResponder = res.responder || res;
      setResponder(updatedResponder);
      localStorage.setItem("responder", JSON.stringify(updatedResponder));
      toast.success("Profile updated!");
      setShowEditProfile(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  /* ======================= Handle alert selection ======================= */
  const handleAlertSelection = (alert) => {
    setSelectedAlert(alert);
    setResponderToAssign("");
    
    // Fetch nearby responders for this alert
    fetchNearbyResponders(alert._id);
    
    // Pan to alert's location
    if (alert.location?.latitude && alert.location?.longitude) {
      setUserLocation({ 
        lat: alert.location.latitude, 
        lng: alert.location.longitude 
      });
    }
  };

  /* ======================= Map helpers (icons) ======================= */
  const getGoogleSize = (w, h) => {
    try {
      if (window?.google?.maps?.Size) return new window.google.maps.Size(w, h);
      return { width: w, height: h };
    } catch {
      return { width: w, height: h };
    }
  };

  /* ======================= Render gating ============ */
  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  /* ======================= JSX ============ */
  return (
    <div className="relative bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-primary">🚨 Emergency Responder Dashboard</h1>

        <div className="flex items-center space-x-4 flex-wrap gap-2">
          {/* Status Filter */}
          <select className="p-2 border rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Alerts</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          {/* Area Filter */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={inMyArea} onChange={() => setInMyArea(!inMyArea)} className="w-5 h-5" />
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
              <button className="bg-indigo-600 text-white py-2 px-4 rounded shadow">{responder.name} ⬇</button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg p-4 hidden group-hover:block z-50">
                <h3 className="text-lg font-bold mb-2">{responder.name}</h3>
                <p>
                  <strong>Email:</strong> {responder.email}
                </p>
                <p>
                  <strong>NIC:</strong> {responder.NIC}
                </p>
                <p>
                  <strong>Type:</strong> {responder.responderType}
                </p>
                <p>
                  <strong>Position:</strong> {responder.position}
                </p>
                <p>
                  <strong>Status:</strong> {responder.status}
                </p>
                <div className="mt-3 flex flex-col space-y-2">
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded" onClick={() => setShowEditProfile(true)}>
                    Edit Profile
                  </button>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow" onClick={() => navigate("/accepted-tasks")}>
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
            {filteredAlerts.length === 0 && <p className="text-gray-500 text-center mt-4">No alerts</p>}
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-xl border cursor-pointer hover:bg-blue-50 transition ${selectedAlert?._id === alert._id ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                onClick={() => handleAlertSelection(alert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAlertSelection(alert);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{(alert.emergencyType || alert.emergency || "EMERGENCY").toUpperCase()}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeClasses(alert.status)}`}>{alert.status}</span>
                </div>
                <p className="text-sm text-gray-600">{alert.address || (alert.location?.mapLink ? "See map" : "No address")}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <div><strong>Name:</strong> {alert.name || "Unknown"}</div>
                  <div><strong>Age:</strong> {alert.age || "—"}</div>
                  <div><strong>Number:</strong> {alert.number || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Map */}
        <div className="col-span-9 relative">
          <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={12} options={{ styles: mapStyles }}>
            {/* User Marker */}
            <MarkerF
              position={userLocation}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="0" y="30" font-size="30">🦺</text></svg>`),
                scaledSize: getGoogleSize(40, 40),
              }}
            />

            {inMyArea && (
              <CircleF
                center={userLocation}
                radius={radius * 1000}
                options={{
                  fillColor: "blue",
                  fillOpacity: 0.08,
                  strokeColor: "blue",
                  strokeOpacity: 0.35,
                  strokeWeight: 1,
                }}
              />
            )}

            {/* Alert Markers */}
            {filteredAlerts.map((alert) => {
              if (!alert.location?.latitude || !alert.location?.longitude) return null;
              const lat = alert.location.latitude;
              const lng = alert.location.longitude;

              return (
                <MarkerF
                  key={alert._id}
                  position={{ lat, lng }}
                  onClick={() => handleAlertSelection(alert)}
                  icon={{
                    url: markerIconForStatus(alert.status),
                    scaledSize: getGoogleSize(40, 40),
                  }}
                />
              );
            })}

            {selectedAlert?.location?.latitude && selectedAlert?.location?.longitude && (
              <InfoWindowF
                position={{
                  lat: selectedAlert.location.latitude,
                  lng: selectedAlert.location.longitude,
                }}
                onCloseClick={() => {
                  setSelectedAlert(null);
                  setNearbyResponders([]);
                  setResponderToAssign("");
                }}
              >
                <div className="text-sm max-w-xs">
                  <h3 className="font-bold text-blue-600 text-lg mb-1">
                    {selectedAlert.emergencyType || selectedAlert.emergency}
                  </h3>

                  <div className="mb-1 text-gray-700">
                    <div><strong>Name:</strong> {selectedAlert.name || "Unknown"}</div>
                    <div><strong>Age:</strong> {selectedAlert.age || "—"}</div>
                    <div><strong>Number:</strong> {selectedAlert.number || "—"}</div>
                  </div>

                  <p className="text-gray-700 mb-2">
                    <strong>Address:</strong>{" "}
                    {selectedAlert.address || (selectedAlert.location.mapLink ? (
                      <a href={selectedAlert.location.mapLink} target="_blank" rel="noreferrer" className="text-blue-500 underline">Map Link</a>
                    ) : "N/A")}
                  </p>

                  <p className="text-xs text-gray-500 mb-2">
                    <strong>Comment:</strong> {selectedAlert.comment || "No comment"}
                  </p>

                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(selectedAlert.status)}`}>
                      {selectedAlert.status}
                    </span>
                    {selectedAlert.reportId && <span className="ml-2 text-xs text-gray-500">Report: {selectedAlert.reportId}</span>}
                  </div>

                  {/* ✅ Accept Task Button - Shows for pending status */}
                  {selectedAlert.status?.toLowerCase() === "pending" && (
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded w-full mb-3 font-semibold shadow-lg"
                      onClick={() => handleAccept(selectedAlert)}
                    >
                      ✅ Accept Task
                    </button>
                  )}
                  {/* Show message if already accepted */}
                  {selectedAlert.status?.toLowerCase() === "accepted" && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-2 rounded mb-3 text-xs">
                      ✅ Task already accepted
                    </div>
                  )}

                  {/* ✅ Assign New Responder Section */}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">🧍 Assign New Responder</h4>
                    
                    {isLoadingResponders ? (
                      <p className="text-xs text-gray-500 mb-2">Loading responders...</p>
                    ) : nearbyResponders.length === 0 ? (
                      <p className="text-xs text-gray-500 mb-2">No active responders nearby (within 10km, same position)</p>
                    ) : (
                      <p className="text-xs text-gray-500 mb-2">Found {nearbyResponders.length} nearby responders</p>
                    )}

                    <select
                      className="w-full border rounded px-2 py-1 mb-2 text-sm"
                      value={responderToAssign}
                      onChange={(e) => setResponderToAssign(e.target.value)}
                      disabled={isLoadingResponders || nearbyResponders.length === 0}
                    >
                      <option value="">Select Responder</option>
                      {nearbyResponders.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.position}) - {r.distance}km away
                        </option>
                      ))}
                    </select>

                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded w-full text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handleAssignNewResponder}
                      disabled={!responderToAssign || isLoadingResponders}
                    >
                      Assign Responder
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
              <input type="text" name="name" placeholder="Name" value={editForm.name} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
              <input type="email" name="email" placeholder="Email" value={editForm.email} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
              <input type="text" name="contactNumber" placeholder="Contact Number" value={editForm.contactNumber} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
              <input type="text" name="address" placeholder="Address" value={editForm.address} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
              <input type="text" name="position" placeholder="Position" value={editForm.position} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded" onClick={() => setShowEditProfile(false)}>
                Cancel
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={handleProfileSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}