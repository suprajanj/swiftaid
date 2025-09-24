import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";

const GOOGLE_MAP_LIBRARIES = [];
const socket = io("http://localhost:4000");

function AdminDashboard() {
  const API_URL = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    number: "",
    emergencyType: "",
    latitude: "",
    longitude: "",
    mapLink: "",
  });

  const [emergencies, setEmergencies] = useState([]);
  const [availableResponders, setAvailableResponders] = useState([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [selectedResponder, setSelectedResponder] = useState("");
  const [editingSOS, setEditingSOS] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    age: "",
    number: "",
    emergencyType: "",
    latitude: "",
    longitude: "",
    mapLink: "",
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_URL,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // Fetch SOS
  const fetchEmergencies = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/sos");
      setEmergencies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch available responders by type
  const fetchResponders = async (type) => {
    if (!type) return setAvailableResponders([]);
    try {
      const res = await axios.get("http://localhost:4000/api/responders");
      const filtered = res.data.filter((r) => r.emergencyType === type && r.availability);
      setAvailableResponders(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmergencies();

    socket.on("responderAssigned", ({ sosId, responderId }) => {
      setEmergencies((prev) =>
        prev.map((e) =>
          e._id === sosId ? { ...e, assignedResponder: { _id: responderId } } : e
        )
      );
    });

    return () => socket.off("responderAssigned");
  }, []);

  // Add SOS
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
      name: formData.name,
      age: formData.age,
      number: formData.number,
      emergencyType: formData.emergencyType,
      location: {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        mapLink: formData.mapLink,
      },
    };
    try {
      await axios.post("http://localhost:4000/api/sos", payload);
      alert("🚨 Emergency added successfully!");
      setFormData({
        name: "",
        age: "",
        number: "",
        emergencyType: "",
        latitude: "",
        longitude: "",
        mapLink: "",
      });
      fetchEmergencies();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add emergency case.");
    }
  };

  const unassignedEmergencies = emergencies.filter((e) => !e.assignedResponder);

  // Assign Responder
  const openAssignModal = (sos) => {
    setSelectedSOS(sos);
    fetchResponders(sos.emergencyType);
    setSelectedResponder("");
  };

  const handleAssignResponder = async () => {
    if (!selectedResponder) return alert("Select a responder first!");
    try {
      await axios.post(`http://localhost:4000/api/sos/assign`, {
        sosId: selectedSOS._id,
        responderId: selectedResponder,
      });
      alert("✅ Responder assigned successfully!");
      setSelectedSOS(null);
      fetchEmergencies();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign responder");
    }
  };

  // Edit SOS
  const openEditModal = (sos) => {
    setEditingSOS(sos);
    setEditFormData({
      name: sos.name,
      age: sos.age,
      number: sos.number,
      emergencyType: sos.emergencyType,
      latitude: sos.location.latitude,
      longitude: sos.location.longitude,
      mapLink: sos.location.mapLink,
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
        name: editFormData.name,
        age: editFormData.age,
        number: editFormData.number,
        emergencyType: editFormData.emergencyType,
        location: {
          latitude: parseFloat(editFormData.latitude),
          longitude: parseFloat(editFormData.longitude),
          mapLink: editFormData.mapLink,
        },
      });
      alert("✅ SOS updated successfully!");
      setEditingSOS(null);
      fetchEmergencies();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update SOS");
    }
  };

  // Delete SOS
  const handleDeleteSOS = async (sosId) => {
    if (!confirm("Are you sure you want to delete this SOS?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/sos/${sosId}`);
      alert("✅ SOS deleted successfully!");
      fetchEmergencies();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete SOS");
    }
  };

  // Map markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const markers = [];

    emergencies.forEach((e) => {
      const position = {
        lat: parseFloat(e.location.latitude),
        lng: parseFloat(e.location.longitude),
      };
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: e.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: e.assignedResponder ? "green" : "red",
          fillOpacity: 0.9,
          strokeWeight: 1,
        },
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div>
          <strong>${e.emergencyType}</strong><br/>
          ${e.name} (${e.age})<br/>
          Contact: ${e.number}<br/>
          Responder: ${e.assignedResponder ? e.assignedResponder.name : "Unassigned"}
        </div>`,
      });
      marker.addListener("click", () => infoWindow.open(map, marker));
      markers.push(marker);
    });

    return () => markers.forEach((m) => m.setMap(null));
  }, [isLoaded, emergencies]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-black p-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 drop-shadow-sm">
          🚨 SwiftAid — Admin & Dispatcher
        </h1>
        <p className="text-gray-600 mt-2">Manage SOS alerts & responders in real-time</p>
      </header>

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-5 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🟢 All Active SOS Requests ({emergencies.length})
          </h2>
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {emergencies.map((e) => (
              <li key={e._id} className={`p-3 rounded-lg ${e.assignedResponder ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"}`}>
                <p className="font-medium">{e.emergencyType} — {e.name} ({e.age})</p>
                <p className="text-sm">{e.assignedResponder ? `Responder: ${e.assignedResponder.name}` : "No responder assigned"}</p>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500" onClick={() => openEditModal(e)}>Edit</button>
                  <button className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteSOS(e._id)}>Delete</button>
                  {!e.assignedResponder && <button className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => openAssignModal(e)}>Assign Responder</button>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            🔴 Unassigned SOS Requests ({unassignedEmergencies.length})
          </h2>
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {unassignedEmergencies.map((e) => (
              <li key={e._id} className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg cursor-pointer hover:bg-red-100" onClick={() => openAssignModal(e)}>
                <p className="font-medium">{e.emergencyType} — {e.name} ({e.age})</p>
                <p className="text-sm text-red-600">No responder assigned</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Emergency Form */}
      <div className="mt-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">➕ Add Emergency Case</h2>
        <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8 space-y-5 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
          </div>
          <input type="tel" name="number" placeholder="Contact Number" value={formData.number} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
          <select name="emergencyType" value={formData.emergencyType} onChange={handleChange} required className="p-2 border rounded-lg w-full">
            <option value="">Select Emergency Type</option>
            <option value="Medical">Medical</option>
            <option value="Fire">Fire</option>
            <option value="Police">Police</option>
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
            <input type="text" name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} required className="p-2 border rounded-lg w-full"/>
          </div>
          <input type="url" name="mapLink" value={formData.mapLink} readOnly className="p-2 border rounded-lg w-full bg-gray-100"/>
          <button type="submit" className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700">🚑 Add Emergency Case</button>
        </form>
      </div>

      {/* Map */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">🌍 Live Map</h2>
        <div className="rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
          {isLoaded && <GoogleMap mapContainerStyle={{ width: "100%", height: "500px" }} center={{ lat: 7.8731, lng: 80.7718 }} zoom={7} onLoad={(map) => (mapRef.current = map)} />}
        </div>
      </div>

      {/* Assign Modal */}
      {selectedSOS && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Assign Responder</h2>
            <p className="mb-2 font-medium">{selectedSOS.emergencyType} — {selectedSOS.name} ({selectedSOS.age})</p>
            <select className="w-full border border-gray-300 rounded-lg p-2 mb-4" value={selectedResponder} onChange={(e) => setSelectedResponder(e.target.value)}>
              <option value="">Select Responder</option>
              {availableResponders.map((r) => (
                <option key={r._id} value={r._id}>{r.name} ({r.number})</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400" onClick={() => setSelectedSOS(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={handleAssignResponder}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSOS && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Edit SOS</h2>
            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} placeholder="Name" className="w-full border border-gray-300 rounded-lg p-2 mb-2"/>
            <input type="number" name="age" value={editFormData.age} onChange={handleEditChange} placeholder="Age" className="w-full border border-gray-300 rounded-lg p-2 mb-2"/>
            <input type="tel" name="number" value={editFormData.number} onChange={handleEditChange} placeholder="Contact Number" className="w-full border border-gray-300 rounded-lg p-2 mb-2"/>
            <select name="emergencyType" value={editFormData.emergencyType} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg p-2 mb-2">
              <option value="">Select Emergency Type</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Police">Police</option>
            </select>
            <input type="text" name="latitude" value={editFormData.latitude} onChange={handleEditChange} placeholder="Latitude" className="w-full border border-gray-300 rounded-lg p-2 mb-2"/>
            <input type="text" name="longitude" value={editFormData.longitude} onChange={handleEditChange} placeholder="Longitude" className="w-full border border-gray-300 rounded-lg p-2 mb-2"/>
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
