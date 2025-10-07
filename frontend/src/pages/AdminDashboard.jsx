// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";
import AssignViaMapModal from "../components/AssignViaMapModal";
import toast, { Toaster } from "react-hot-toast";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const GOOGLE_MAP_LIBRARIES = ["places"];
const socket = io("http://localhost:4000");

function AdminDashboard() {
  const API_URL = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef();
  const audioRef = useRef("../assets/audio.mp3");

  const [activeTab, setActiveTab] = useState("overview");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [formData, setFormData] = useState({
    name: "", age: "", number: "", emergency: "",
    latitude: "", longitude: "", mapLink: "",
  });

  const [emergencies, setEmergencies] = useState([]);
  const [editingSOS, setEditingSOS] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "", age: "", number: "", emergency: "",
    latitude: "", longitude: "", mapLink: "",
  });

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_URL,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // Fetch SOS
  const fetchEmergencies = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/sos");
      setEmergencies(res.data);
    } catch (err) { console.error(err); }
  };

  // Play/Stop alert sound
  const playAlertSound = () => { if (audioRef.current) { audioRef.current.loop = true; audioRef.current.play(); } };
  const stopAlertSound = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } };

  // Socket listeners
  useEffect(() => {
    fetchEmergencies();

    socket.on("responderAssigned", ({ sosId, responderId, responderName }) => {
      setEmergencies((prev) => prev.map((e) =>
        e._id === sosId ? { ...e, assignedResponder: { _id: responderId, name: responderName } } : e
      ));
      toast.success("✅ Responder assigned to SOS");
    });

    socket.on("newSOS", (sos) => {
      // some backends may still emit emergencyType — be tolerant
      const normalized = {
        ...sos,
        emergency: sos.emergency || sos.emergencyType || sos.emergency,
      };
      setEmergencies((prev) => [normalized, ...prev]);
      toast.error(`🚨 New SOS: ${normalized.emergency} for ${normalized.name}`, {
        duration: 8000, position: "top-right", onClick: () => stopAlertSound(),
      });
      playAlertSound();
    });

    socket.on("sosUpdated", (sos) => {
      const normalized = { ...sos, emergency: sos.emergency || sos.emergencyType || sos.emergency };
      setEmergencies((prev) => prev.map((e) => e._id === normalized._id ? normalized : e));
      toast("✏️ SOS updated", { icon: "✏️" });
    });

    socket.on("sosDeleted", (sosId) => {
      setEmergencies((prev) => prev.filter((e) => e._id !== sosId));
      toast("🗑️ SOS deleted", { icon: "🗑️" });
    });

    return () => {
      socket.off("responderAssigned");
      socket.off("newSOS");
      socket.off("sosUpdated");
      socket.off("sosDeleted");
    };
  }, []);

  const unassignedEmergencies = emergencies.filter((e) => !e.assignedResponder);
  const statusCounts = { Pending: 0, Assigned: 0, Completed: 0 };
  emergencies.forEach(e => { const s = e.status || "Pending"; statusCounts[s] = (statusCounts[s] || 0) + 1; });

  const filteredEmergencies = emergencies.filter(e =>
    (filterType === "All" || e.emergency === filterType) &&
    (filterStatus === "All" || (e.status || "Pending") === filterStatus)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    if ((name === "latitude" || name === "longitude") && updated.latitude && updated.longitude) {
      updated.mapLink = `https://www.google.com/maps?q=${updated.latitude},${updated.longitude}`;
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name, age: formData.age, number: formData.number,
      // now uses `emergency` to match your new SOS model
      emergency: formData.emergency,
      location: {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        mapLink: formData.mapLink,
      },
    };
    try {
      await axios.post("http://localhost:4000/api/sos", payload);
      toast.success("🚨 New SOS created!");
      stopAlertSound();
      setFormData({ name: "", age: "", number: "", emergency: "", latitude: "", longitude: "", mapLink: "" });
      fetchEmergencies();
    } catch (err) { console.error(err); toast.error("❌ Failed to add SOS"); }
  };

  const openAssignModal = (sos) => { setSelectedSOS(sos); setMapModalOpen(true); };
  const openEditModal = (sos) => {
    setEditingSOS(sos);
    setEditFormData({
      name: sos.name, age: sos.age, number: sos.number,
      emergency: sos.emergency || sos.emergencyType || "",
      latitude: sos.location?.latitude,
      longitude: sos.location?.longitude,
      mapLink: sos.location?.mapLink,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...editFormData, [name]: value };
    if ((name === "latitude" || name === "longitude") && updated.latitude && updated.longitude) {
      updated.mapLink = `https://www.google.com/maps?q=${updated.latitude},${updated.longitude}`;
    }
    setEditFormData(updated);
  };

  const handleUpdateSOS = async () => {
    if (!editingSOS) return;
    try {
      await axios.put(`http://localhost:4000/api/sos/${editingSOS._id}`, {
        name: editFormData.name, age: editFormData.age, number: editFormData.number,
        emergency: editFormData.emergency,
        location: {
          latitude: parseFloat(editFormData.latitude),
          longitude: parseFloat(editFormData.longitude),
          mapLink: editFormData.mapLink,
        },
      });
      toast("✏️ SOS updated", { icon: "✏️" });
      setEditingSOS(null);
      fetchEmergencies();
      socket.emit("sosUpdated", editingSOS._id);
    } catch (err) { console.error(err); toast.error("❌ Failed to update SOS"); }
  };

  const handleDeleteSOS = async (sosId) => {
    if (!confirm("Are you sure you want to delete this SOS?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/sos/${sosId}`);
      toast("🗑️ SOS deleted", { icon: "🗑️" });
      fetchEmergencies();
      socket.emit("sosDeleted", sosId);
    } catch (err) { console.error(err); toast.error("❌ Failed to delete SOS"); }
  };

  const handleCompleteSOS = async (sosId) => {
    if (!confirm("Mark this SOS as completed?")) return;
    try {
      await axios.patch(`http://localhost:4000/api/sos/${sosId}/complete`);
      toast.success("✅ SOS marked as completed");
      fetchEmergencies();
      socket.emit("sosUpdated", sosId); // notify others
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to mark as completed");
    }
  };

  useEffect(() => {
    if (mapRef.current && emergencies.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      emergencies.forEach(e => bounds.extend({ lat: parseFloat(e.location.latitude), lng: parseFloat(e.location.longitude) }));
      mapRef.current.fitBounds(bounds);
    }
  }, [emergencies, isLoaded]);

  // Chart Data
  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];
  const emergencyTypeCounts = emergencies.reduce((acc, e) => {
    const key = e.emergency || e.emergencyType || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const emergencyTypeData = Object.keys(emergencyTypeCounts).map((k) => ({ name: k, value: emergencyTypeCounts[k] }));

 const [responders, setResponders] = useState([]);

useEffect(() => {
  const fetchResponders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/responders");
      setResponders(res.data);
    } catch (err) {
      console.error("Error fetching responders:", err);
    }
  };
  fetchResponders();
}, []);

const availableCount = responders.filter((r) => r.status === "available").length;
const busyCount = responders.filter((r) => r.status === "busy").length;

// if your system tracks online/offline separately, replace below accordingly
const responderAvailability = [
  { name: "Available", value: availableCount },
  { name: "Busy", value: busyCount },
];

const [autoAssign, setAutoAssign] = useState(false);

// Fetch initial toggle state from backend
useEffect(() => {
  axios.get("http://localhost:4000/api/settings/auto-assign")
    .then((res) => setAutoAssign(res.data.enabled))
    .catch(console.error);
}, []);

const toggleAutoAssign = async () => {
  try {
    const newState = !autoAssign;
    setAutoAssign(newState);
    await axios.post("http://localhost:4000/api/settings/auto-assign", {
      enabled: newState,
    });
    toast.success(`Auto Assignment ${newState ? "Enabled" : "Disabled"}`);
  } catch (err) {
    console.error(err);
    toast.error("Failed to update Auto Assign setting");
  }
};

function ReportSection() {
  const [csvLink, setCsvLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");

  const generateReport = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/admin/generate-reports");
      // Assuming API returns { csvPath, pdfPath }
      setCsvLink(`http://localhost:4000/${res.data.csvPath}`);
      setPdfLink(`http://localhost:4000/${res.data.pdfPath}`);
    } catch (err) {
      console.error("Failed to generate reports", err);
    }
  };}
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-black p-6">
      <Toaster />
      <audio ref={audioRef} src="/sos-alert.mp3" />

      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 drop-shadow-sm">🚨 SwiftAid — Dispatcher</h1>
        <p className="text-gray-600 mt-2">Manage SOS alerts & responders in real-time</p>
        <div className="flex items-center justify-center mb-4 gap-3">
            <label className="font-semibold text-gray-700">⚙️ Auto Assign Responders</label>
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={toggleAutoAssign}
              className="w-5 h-5 accent-red-600"
            />
            <span className={`font-semibold ${autoAssign ? "text-green-600" : "text-gray-500"}`}>
              {autoAssign ? "Enabled" : "Disabled"}
            </span>
          </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center mb-6 gap-4">
        {["overview", "sos", "map"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === tab ? "bg-red-600 text-white" : "bg-white border"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "sos" ? "SOS Management" : "Live Map"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Motivational Banner */}
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-2xl shadow-xl p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold">💪 Stay Alert, Save Lives!</h2>
            <p className="mt-2 text-lg">Every second counts — your quick action can make the difference.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-5 rounded-2xl shadow-xl text-center">
              <p className="text-lg font-semibold">Total SOS</p>
              <p className="text-3xl font-bold text-red-600">{emergencies.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-xl text-center">
              <p className="text-lg font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{statusCounts.Pending}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-xl text-center">
              <p className="text-lg font-semibold">Assigned</p>
              <p className="text-3xl font-bold text-blue-600">{statusCounts.Assigned}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-xl text-center">
              <p className="text-lg font-semibold">Completed</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.Completed}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Type Distribution */}
            <div className="bg-white p-5 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold mb-4">📊 Emergency Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={emergencyTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                    {emergencyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Responder Availability Snapshot */}
            <div className="bg-white p-5 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold mb-4">🧑‍🚒 Responder Availability Snapshot</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responderAvailability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* SOS Management Tab */}
      {activeTab === "sos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SOS Requests */}
          <div className="bg-white p-5 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📋 SOS Requests</h2>
              <div className="flex gap-2">
                <select
                  className="border rounded-lg p-1"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Medical">Medical</option>
                  <option value="Fire">Fire</option>
                  <option value="Police">Police</option>
                </select>
                <select
                  className="border rounded-lg p-1"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <ul className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredEmergencies.map((e) => (
                <li
                  key={e._id}
                  className={`p-4 rounded-lg border-l-4 ${
                    e.status === "Pending"
                      ? "bg-yellow-50 border-yellow-500"
                      : e.status === "Assigned"
                      ? "bg-blue-50 border-blue-500"
                      : "bg-green-50 border-green-500"
                  }`}
                >
                  <p className="font-medium">
                    {e.emergency} — {e.name} ({e.age})
                  </p>
                  <p className="text-sm">Status: {e.status || "Pending"}</p>
                  <p className="text-sm">
                    {e.assignedResponder
                      ? `Responder: ${e.assignedResponder.name}`
                      : "No responder assigned"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500"
                      onClick={() => openEditModal(e)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      onClick={() => handleDeleteSOS(e._id)}
                    >
                      Delete
                    </button>
                    {!e.assignedResponder && (
                      <button
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => openAssignModal(e)}
                      >
                        Assign via Map
                      </button>
                    )}
                    {e.status === "Assigned" && (
                      <button
                        className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        onClick={() => handleCompleteSOS(e._id)}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Add SOS Form */}
          <div className="bg-white p-5 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">➕ Add Emergency Case</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="tel"
                name="number"
                placeholder="Contact Number"
                value={formData.number}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              />
              <select
                name="emergency"
                value={formData.emergency}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Emergency Type</option>
                <option value="Medical">Medical</option>
                <option value="Fire">Fire</option>
                <option value="Police">Police</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="latitude"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="p-2 border rounded-lg w-full"
                />
                <input
                  type="text"
                  name="longitude"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="p-2 border rounded-lg w-full"
                />
              </div>
              <input
                type="url"
                name="mapLink"
                value={formData.mapLink}
                readOnly
                className="p-2 border rounded-lg w-full bg-gray-100"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
              >
                🚑 Add Emergency Case
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Live Map Tab */}
      {activeTab === "map" && (
        <div className="rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto mt-6">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "500px" }}
              center={{ lat: 7.8731, lng: 80.7718 }}
              zoom={7}
              onLoad={(map) => (mapRef.current = map)}
            >
              {emergencies.map((e) => (
                <Marker
                  key={e._id}
                  position={{ lat: parseFloat(e.location.latitude), lng: parseFloat(e.location.longitude) }}
                  title={`${e.emergency} — ${e.name}`}
                  onClick={() => openAssignModal(e)}
                  icon={{
                    url: e.assignedResponder
                      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      )}
      

      {/* Assign Modal */}
      {mapModalOpen && selectedSOS && (
        <AssignViaMapModal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} sos={selectedSOS} onAssigned={fetchEmergencies} isLoaded={isLoaded} />
      )}

      {/* Edit Modal */}
      {editingSOS && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Edit SOS</h2>
            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} placeholder="Name" className="w-full border border-gray-300 rounded-lg p-2 mb-2" />
            <input type="number" name="age" value={editFormData.age} onChange={handleEditChange} placeholder="Age" className="w-full border border-gray-300 rounded-lg p-2 mb-2" />
            <input type="tel" name="number" value={editFormData.number} onChange={handleEditChange} placeholder="Contact Number" className="w-full border border-gray-300 rounded-lg p-2 mb-2" />
            <select name="emergency" value={editFormData.emergency} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg p-2 mb-2">
              <option value="">Select Emergency Type</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Police">Police</option>
            </select>
            <input type="text" name="latitude" value={editFormData.latitude} onChange={handleEditChange} placeholder="Latitude" className="w-full border border-gray-300 rounded-lg p-2 mb-2" />
            <input type="text" name="longitude" value={editFormData.longitude} onChange={handleEditChange} placeholder="Longitude" className="w-full border border-gray-300 rounded-lg p-2 mb-2" />
            <div className="flex justify-end gap-3 mt-3">
              <button className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400" onClick={() => setEditingSOS(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700" onClick={handleUpdateSOS}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
