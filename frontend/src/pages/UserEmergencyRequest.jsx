import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  MapPin,
  Loader2,
  ArrowLeft,
  Edit3,
  Save,
  Crosshair,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserEmergencyRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    number: "",
    emergency: "",
    latitude: "",
    longitude: "",
  });

  const navigate = useNavigate();

  // ✅ Fetch only logged-in user's SOS requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // 1. Get logged-in user
        const userRes = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = userRes.data._id;

        const res = await axios.get(
          `http://localhost:3000/api/sos/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching SOS requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Delete request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/sos/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
    } catch (error) {
      console.error("Error deleting SOS request:", error);
    }
  };

  // Start editing
  const handleEdit = (req) => {
    setEditingId(req._id);
    setEditForm({
      name: req.name,
      age: req.age,
      number: req.number,
      emergency: req.emergency,
      latitude: req.location?.latitude || "",
      longitude: req.location?.longitude || "",
    });
  };

  // Autofill location from browser
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditForm({
          ...editForm,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Unable to retrieve location");
      }
    );
  };

  // Update request
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: editForm.name,
        age: editForm.age,
        number: editForm.number,
        emergency: editForm.emergency,
        location: {
          latitude: editForm.latitude,
          longitude: editForm.longitude,
        },
      };

      const res = await axios.put(
        `http://localhost:3000/api/sos/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(requests.map((req) => (req._id === id ? res.data : req)));
      setEditingId(null);
      setEditForm({
        name: "",
        age: "",
        number: "",
        emergency: "",
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      console.error("Error updating SOS request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:bg-gray-200 rounded-lg p-2 transition"
      >
        <ArrowLeft size={20} /> Back to Profile
      </button>

      <h1 className="text-3xl font-bold mb-6">My Emergency Requests</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-gray-600" size={40} />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 text-center">
          No emergency requests found.
        </p>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center"
            >
              {editingId === req._id ? (
                // Edit Form
                <div className="flex-1">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Name"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm({ ...editForm, age: e.target.value })
                    }
                    placeholder="Age"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    value={editForm.number}
                    onChange={(e) =>
                      setEditForm({ ...editForm, number: e.target.value })
                    }
                    placeholder="Phone"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="text"
                    value={editForm.emergency}
                    onChange={(e) =>
                      setEditForm({ ...editForm, emergency: e.target.value })
                    }
                    placeholder="Emergency Type"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="number"
                    value={editForm.latitude}
                    onChange={(e) =>
                      setEditForm({ ...editForm, latitude: e.target.value })
                    }
                    placeholder="Latitude"
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="number"
                    value={editForm.longitude}
                    onChange={(e) =>
                      setEditForm({ ...editForm, longitude: e.target.value })
                    }
                    placeholder="Longitude"
                    className="border p-2 rounded w-full mb-2"
                  />

                  <button
                    onClick={handleGetLocation}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-3"
                  >
                    <Crosshair size={18} /> Use My Location
                  </button>

                  <button
                    onClick={() => handleUpdate(req._id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    <Save size={18} /> Save
                  </button>
                </div>
              ) : (
                // Normal View
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {req.emergency}
                  </h2>
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {req.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Age:</span> {req.age}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {req.number}
                  </p>
                  {req.location && (
                    <a
                      href={`https://www.google.com/maps?q=${req.location.latitude},${req.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
                    >
                      <MapPin size={16} /> View Location
                    </a>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Created: {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    editingId === req._id ? setEditingId(null) : handleEdit(req)
                  }
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-full"
                  title="Edit Request"
                >
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(req._id)}
                  className="text-red-600 hover:bg-red-100 p-2 rounded-full"
                  title="Delete Request"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserEmergencyRequest;
