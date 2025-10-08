// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Form validation functions (moved outside component to prevent re-renders)
const validateForm = (data, isEdit = false) => {
  const errors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (!/^[a-zA-Z\s]+$/.test(data.name.trim())) {
    errors.name = "Name can only contain letters and spaces";
  }

  // Age validation
  if (!data.age) {
    errors.age = "Age is required";
  } else if (isNaN(data.age) || parseInt(data.age) < 1 || parseInt(data.age) > 120) {
    errors.age = "Age must be between 1 and 120";
  }

  // Phone number validation
   if (!data.number.trim()) {
    errors.number = "Phone number is required";
  } else {
    // Remove all non-digit characters
    const cleanNumber = data.number.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      errors.number = "Phone number must be exactly 10 digits";
    } else if (!/^[0-9]{10}$/.test(cleanNumber)) {
      errors.number = "Please enter a valid phone number";
    }
  }

  // Emergency type validation
  if (!data.emergency) {
    errors.emergency = "Emergency type is required";
  }

  // Latitude validation
  if (!data.latitude) {
    errors.latitude = "Latitude is required";
  } else if (isNaN(data.latitude) || parseFloat(data.latitude) < -90 || parseFloat(data.latitude) > 90) {
    errors.latitude = "Latitude must be between -90 and 90";
  }

  // Longitude validation
  if (!data.longitude) {
    errors.longitude = "Longitude is required";
  } else if (isNaN(data.longitude) || parseFloat(data.longitude) < -180 || parseFloat(data.longitude) > 180) {
    errors.longitude = "Longitude must be between -180 and 180";
  }

  return errors;
};

// Reusable form components (moved outside to prevent re-renders)
const InputField = React.memo(({ label, name, value, onChange, error, type = "text", placeholder, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
        error 
          ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50" 
          : "border-slate-300 focus:ring-red-500 focus:border-transparent"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠️ {error}</p>}
  </div>
));

const SelectField = React.memo(({ label, name, value, onChange, error, options, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
        error 
          ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50" 
          : "border-slate-300 focus:ring-red-500 focus:border-transparent"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠️ {error}</p>}
  </div>
));

const emergencyOptions = [
  { value: "Medical", label: "Medical" },
  { value: "Fire", label: "Fire" },
  { value: "Police", label: "Police" },
  { value: "road", label: "Road Accident" }
];

function AdminDashboard() {
  const API_URL = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef();
  const audioRef = useRef("../assets/audio.mp3");

  const [activeTab, setActiveTab] = useState("overview");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  
  // Optimized change handlers with useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate map link when both coordinates are provided
      if ((name === "latitude" || name === "longitude") && updated.latitude && updated.longitude) {
        updated.mapLink = `https://www.google.com/maps?q=${updated.latitude},${updated.longitude}`;
      }
      
      return updated;
    });

    // Clear error when user starts typing (debounced)
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setEditFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if ((name === "latitude" || name === "longitude") && updated.latitude && updated.longitude) {
        updated.mapLink = `https://www.google.com/maps?q=${updated.latitude},${updated.longitude}`;
      }
      
      return updated;
    });

    // Clear error when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [editFormErrors]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("❌ Please fix the form errors");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      age: parseInt(formData.age),
      number: formData.number.trim(),
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
      setFormErrors({});
      fetchEmergencies();
    } catch (err) { 
      console.error(err); 
      toast.error("❌ Failed to add SOS"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = (sos) => { setSelectedSOS(sos); setMapModalOpen(true); };
  
  const openEditModal = (sos) => {
    setEditingSOS(sos);
    setEditFormData({
      name: sos.name, 
      age: sos.age, 
      number: sos.number,
      emergency: sos.emergency || sos.emergencyType || "",
      latitude: sos.location?.latitude?.toString() || "",
      longitude: sos.location?.longitude?.toString() || "",
      mapLink: sos.location?.mapLink || "",
    });
    setEditFormErrors({});
  };

  const handleUpdateSOS = async () => {
    if (!editingSOS) return;
    
    const errors = validateForm(editFormData, true);
    setEditFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("❌ Please fix the form errors");
      return;
    }

    try {
      await axios.put(`http://localhost:4000/api/sos/${editingSOS._id}`, {
        name: editFormData.name.trim(),
        age: parseInt(editFormData.age),
        number: editFormData.number.trim(),
        emergency: editFormData.emergency,
        location: {
          latitude: parseFloat(editFormData.latitude),
          longitude: parseFloat(editFormData.longitude),
          mapLink: editFormData.mapLink,
        },
      });
      toast.success("✏️ SOS updated successfully!");
      setEditingSOS(null);
      fetchEmergencies();
      socket.emit("sosUpdated", editingSOS._id);
    } catch (err) { 
      console.error(err); 
      toast.error("❌ Failed to update SOS"); 
    }
  };

  const handleDeleteSOS = async (sosId) => {
    if (!confirm("Are you sure you want to delete this SOS?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/sos/${sosId}`);
      toast.success("🗑️ SOS deleted successfully!");
      fetchEmergencies();
      socket.emit("sosDeleted", sosId);
    } catch (err) { 
      console.error(err); 
      toast.error("❌ Failed to delete SOS"); 
    }
  };

  const handleCompleteSOS = async (sosId) => {
    if (!confirm("Mark this SOS as completed?")) return;
    try {
      await axios.patch(`http://localhost:4000/api/sos/${sosId}/complete`);
      toast.success("✅ SOS marked as completed");
      fetchEmergencies();
      socket.emit("sosUpdated", sosId);
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
  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4"];
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

  const responderAvailability = [
    { name: "Available", value: availableCount },
    { name: "Busy", value: busyCount },
  ];

  const [autoAssign, setAutoAssign] = useState(false);

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

  const [reportLinks, setReportLinks] = useState({ csv: "", pdf: "" });

  const generateReports = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/admin/generate-reports");
      setReportLinks(res.data);
      toast.success("📊 Reports generated successfully!");
    } catch (err) {
      console.error("Error generating reports:", err);
      toast.error("❌ Failed to generate reports");
    }
  };

  // Status badges with better styling
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pending" },
      Assigned: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Assigned" },
      Completed: { color: "bg-green-100 text-green-800 border-green-300", label: "Completed" }
    };
    
    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Emergency type badges
  const EmergencyBadge = ({ type }) => {
    const typeConfig = {
      Medical: { color: "bg-red-100 text-red-800 border-red-300", icon: "🏥" },
      Fire: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: "🔥" },
      Police: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: "🚔" },
      road: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: "🛣️" }
    };
    
    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800 border-gray-300", icon: "🚨" };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${config.color}`}>
        <span>{config.icon}</span>
        <span>{type}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 p-4 md:p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      <audio ref={audioRef} src="/sos-alert.mp3" />

      {/* Enhanced Header */}
      <header className="mb-8 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <span className="text-3xl">🚨</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  SwiftAid Dispatcher
                </h1>
                <p className="text-slate-600 mt-1 font-medium">Manage SOS alerts & responders in real-time</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${autoAssign ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  <span className="font-semibold text-slate-700">Auto Assign</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={toggleAutoAssign}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
                <span className={`font-semibold ${autoAssign ? "text-green-600" : "text-slate-500"}`}>
                  {autoAssign ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-2 border border-slate-200">
          <div className="flex gap-1">
            {["overview", "sos", "map"].map(tab => (
              <button
                key={tab}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab 
                    ? "bg-red-600 text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" ? "📊 Overview" : tab === "sos" ? "🚨 SOS Management" : "🗺️ Live Map"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Enhanced Motivational Banner */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-2xl shadow-xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">💪 Stay Alert, Save Lives!</h2>
              <p className="text-lg opacity-95 max-w-2xl mx-auto">Every second counts — your quick action can make the difference between life and death.</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
          </div>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total SOS", value: emergencies.length, color: "bg-gradient-to-r from-slate-600 to-slate-700", icon: "📋" },
              { label: "Pending", value: statusCounts.Pending, color: "bg-gradient-to-r from-amber-500 to-amber-600", icon: "⏳" },
              { label: "Assigned", value: statusCounts.Assigned, color: "bg-gradient-to-r from-blue-500 to-blue-600", icon: "👨‍🚒" },
              { label: "Completed", value: statusCounts.Completed, color: "bg-gradient-to-r from-green-500 to-green-600", icon: "✅" }
            ].map((card, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 transition-transform hover:scale-[1.02] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 font-medium">{card.label}</p>
                    <p className="text-3xl font-bold mt-2 text-slate-800">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.color} text-white`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${card.color.split(' ')[1]}`}
                    style={{ width: `${(card.value / Math.max(emergencies.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emergency Type Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-2 rounded-lg">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Emergency Type Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={emergencyTypeData} 
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {emergencyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} cases`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Responder Availability Snapshot */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-xl">👨‍🚒</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Responder Availability</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responderAvailability}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => [`${value} responders`, 'Count']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    fill="#3b82f6"
                    strokeWidth={1}
                    stroke="#1d4ed8"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{availableCount}</p>
                  <p className="text-sm text-green-600 font-medium">Available</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{busyCount}</p>
                  <p className="text-sm text-red-600 font-medium">Busy</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SOS Management Tab */}
      {activeTab === "sos" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced SOS Requests */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <span className="text-xl">📋</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">SOS Requests</h2>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredEmergencies.length} cases
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  className="border border-slate-300 rounded-xl p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Medical">Medical</option>
                  <option value="Fire">Fire</option>
                  <option value="Police">Police</option>
                  <option value="road">Road</option>
                </select>
                <select
                  className="border border-slate-300 rounded-xl p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEmergencies.map((e) => (
                <div
                  key={e._id}
                  className={`p-5 rounded-xl border-l-4 transition-all hover:shadow-md ${
                    e.status === "Pending"
                      ? "bg-amber-50 border-amber-500 hover:bg-amber-75"
                      : e.status === "Assigned"
                      ? "bg-blue-50 border-blue-500 hover:bg-blue-75"
                      : "bg-green-50 border-green-500 hover:bg-green-75"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{e.name} <span className="text-slate-600 text-sm">({e.age})</span></p>
                      <p className="text-slate-600 text-sm mt-1 flex items-center gap-1">
                        <span>📞</span>
                        {e.number}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <EmergencyBadge type={e.emergency} />
                      <StatusBadge status={e.status || "Pending"} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                      {e.assignedResponder ? (
                        <span className="font-medium text-blue-700 flex items-center gap-1">
                          <span>👨‍🚒</span>
                          Responder: {e.assignedResponder.name}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-700 flex items-center gap-1">
                          <span>⏳</span>
                          No responder assigned
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-1"
                        onClick={() => openEditModal(e)}
                      >
                        <span>✏️</span>
                        Edit
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-1"
                        onClick={() => handleDeleteSOS(e._id)}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                      {!e.assignedResponder && (
                        <button
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-1"
                          onClick={() => openAssignModal(e)}
                        >
                          <span>🗺️</span>
                          Assign
                        </button>
                      )}
                      {e.status === "Assigned" && (
                        <button
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-1"
                          onClick={() => handleCompleteSOS(e._id)}
                        >
                          <span>✅</span>
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Add SOS Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-xl">➕</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Add Emergency Case</h2>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  placeholder="Enter full name"
                />
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={formErrors.age}
                  placeholder="Age"
                />
              </div>

              <InputField
                label="Contact Number"
                name="number"
                type="tel"
                value={formData.number}
                onChange={handleChange}
                error={formErrors.number}
                placeholder="Phone number"
              />

              <SelectField
                label="Emergency Type"
                name="emergency"
                value={formData.emergency}
                onChange={handleChange}
                error={formErrors.emergency}
                options={emergencyOptions}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Latitude"
                  name="latitude"
                  type="text"
                  value={formData.latitude}
                  onChange={handleChange}
                  error={formErrors.latitude}
                  placeholder="Latitude"
                />
                <InputField
                  label="Longitude"
                  name="longitude"
                  type="text"
                  value={formData.longitude}
                  onChange={handleChange}
                  error={formErrors.longitude}
                  placeholder="Longitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Map Link
                </label>
                <input
                  type="url"
                  name="mapLink"
                  value={formData.mapLink}
                  readOnly
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                />
                <p className="text-slate-500 text-xs mt-1">Auto-generated from coordinates</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl font-semibold text-lg transform hover:scale-[1.02] duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>🚑</span>
                    Add Emergency Case
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Live Map Tab */}
      {activeTab === "map" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <span className="text-xl">🗺️</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Live SOS Map</h2>
                  <p className="text-slate-600 text-sm mt-1">Real-time tracking of all emergency cases</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={generateReports}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                >
                  <span>📄</span>
                  Generate Reports
                </button>
              </div>
            </div>

            {reportLinks.csv && (
              <div className="flex gap-4 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <a href={reportLinks.csv} download className="text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-2">
                  <span>📊</span>
                  Download CSV Report
                </a>
                <a href={reportLinks.pdf} download className="text-red-600 hover:text-red-800 underline font-medium flex items-center gap-2">
                  <span>📄</span>
                  Download PDF Report
                </a>
              </div>
            )}
          </div>

          <div className="p-4">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "500px", borderRadius: "12px" }}
                center={{ lat: 7.8731, lng: 80.7718 }}
                zoom={7}
                onLoad={(map) => (mapRef.current = map)}
                options={{
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
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
            ) : (
              <div className="h-96 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {mapModalOpen && selectedSOS && (
        <AssignViaMapModal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} sos={selectedSOS} onAssigned={fetchEmergencies} isLoaded={isLoaded} />
      )}

      {/* Enhanced Edit Modal */}
      {editingSOS && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-xl">✏️</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Edit SOS Case</h2>
            </div>
            
            <div className="space-y-4">
              <InputField
                label="Full Name"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                error={editFormErrors.name}
                placeholder="Enter full name"
              />
              
              <InputField
                label="Age"
                name="age"
                type="number"
                value={editFormData.age}
                onChange={handleEditChange}
                error={editFormErrors.age}
                placeholder="Age"
              />
              
              <InputField
                label="Contact Number"
                name="number"
                type="tel"
                value={editFormData.number}
                onChange={handleEditChange}
                error={editFormErrors.number}
                placeholder="Phone number"
              />
              
              <SelectField
                label="Emergency Type"
                name="emergency"
                value={editFormData.emergency}
                onChange={handleEditChange}
                error={editFormErrors.emergency}
                options={emergencyOptions}
              />
              
              <InputField
                label="Latitude"
                name="latitude"
                type="text"
                value={editFormData.latitude}
                onChange={handleEditChange}
                error={editFormErrors.latitude}
                placeholder="Latitude"
              />
              
              <InputField
                label="Longitude"
                name="longitude"
                type="text"
                value={editFormData.longitude}
                onChange={handleEditChange}
                error={editFormErrors.longitude}
                placeholder="Longitude"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Map Link
                </label>
                <input
                  type="url"
                  name="mapLink"
                  value={editFormData.mapLink}
                  readOnly
                  className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button 
                className="px-5 py-2 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800 font-medium transition-colors"
                onClick={() => setEditingSOS(null)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                onClick={handleUpdateSOS}
              >
                <span>💾</span>
                Update Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;