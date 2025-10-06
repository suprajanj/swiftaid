// Userprofile.jsx
import React, { useState, useEffect } from "react";
import {
  Bell,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  Edit3,
  Trash2,
  MapPin,
  Navigation,
  User,
  Phone,
  Calendar,
  Crosshair,
  Save,
  Lock,
  Download,
  Shield,
  Heart,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";

function Userprofile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    blood: "",
    allergy: "",
    condition: "",
    emergencyNumber: "",
  });

  // Emergency requests state
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

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const BASE_USER_API = "http://localhost:3000/api/user";
  const BASE_SOS_API = "http://localhost:3000/api/sos";

  // ✅ Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_USER_API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile. Please login again.");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // ✅ Fetch emergency requests when emergency section is active
  useEffect(() => {
    if (activeSection === "emergencyRequests") {
      fetchEmergencyRequests();
    }
  }, [activeSection]);

  const fetchEmergencyRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const userRes = await axios.get(`${BASE_USER_API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = userRes.data._id;

      const res = await axios.get(`${BASE_SOS_API}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching SOS requests:", error);
      toast.error("Failed to load emergency requests");
    } finally {
      setLoading(false);
    }
  };

  // Profile functions
  const openEdit = (section) => {
    setEditSection(section);
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditSection(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }

      if (!formData._id) {
        toast.error("Missing user ID");
        return;
      }

      const res = await axios.put(
        `${BASE_USER_API}/${formData._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.user) {
        setFormData(res.data.user);
      }

      toast.success(res.data?.message || "Profile updated!");
      closeEdit();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Update failed. Try again.";
      toast.error(msg);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_USER_API}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  // Emergency requests functions
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_SOS_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((req) => req._id !== id));
      toast.success("Emergency request deleted successfully");
    } catch (error) {
      console.error("Error deleting SOS request:", error);
      toast.error("Failed to delete emergency request");
    }
  };

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

      const res = await axios.put(`${BASE_SOS_API}/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      toast.success("Emergency request updated successfully");
    } catch (error) {
      console.error("Error updating SOS request:", error);
      toast.error("Failed to update emergency request");
    }
  };

  // PDF Download function
  const downloadPDF = (request) => {
    const doc = new jsPDF();

    // Add header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("EMERGENCY REQUEST REPORT", 105, 15, { align: "center" });

    // Add emergency type
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`Emergency Type: ${request.emergency.toUpperCase()}`, 20, 45);

    // Add personal details
    doc.setFontSize(12);
    doc.text(`Name: ${request.name}`, 20, 60);
    doc.text(`Age: ${request.age} years`, 20, 70);
    doc.text(`Phone: ${request.number}`, 20, 80);

    // Add location details
    if (request.location) {
      doc.text(
        `Location: Latitude ${request.location.latitude}, Longitude ${request.location.longitude}`,
        20,
        95
      );
      doc.text(
        `Google Maps: https://www.google.com/maps?q=${request.location.latitude},${request.location.longitude}`,
        20,
        105
      );
    }

    // Add timestamp
    doc.text(
      `Created: ${new Date(request.createdAt).toLocaleString()}`,
      20,
      120
    );

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated by Emergency Response System", 105, 280, {
      align: "center",
    });

    doc.save(`emergency-request-${request._id}.pdf`);
  };

  // Change password functions
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }

      // Validate passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      // Call protected change-password API
      const res = await axios.put(
        `${BASE_USER_API}/change-password`,
        passwordForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Success message
      toast.success(res.data.message, { duration: 3000 });

      // Clear form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Remove token to force logout after password change
      localStorage.removeItem("token");

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Password change failed";
      toast.error(msg);
      console.error("Change password error:", err);
    }
  };

  // Render change password content
  const renderChangePassword = () => (
    <div className="flex-1 p-8">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mt-12 flex items-center justify-center gap-3 mb-4">
            <Lock className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              Change Password
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Change Password Form */}
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your new password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Confirm your new password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              Change Password
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Security Note</p>
              <p className="text-xs text-blue-600 mt-1">
                After changing your password, you will be automatically logged
                out and redirected to the login page for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render emergency requests content
  const renderEmergencyRequests = () => (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertTriangle className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">
                My Emergency Requests
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Manage and review your emergency assistance requests
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm border">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading your emergency requests...
            </p>
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              No Emergency Requests
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              You haven't created any emergency requests yet. Your requests will
              appear here once submitted.
            </p>
          </div>
        ) : (
          /* Requests Grid */
          <div className="grid gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-1 bg-gradient-to-r from-blue-50 to-gray-50">
                  {editingId === req._id ? (
                    /* Edit Form */
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter your name"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Age
                            </label>
                            <input
                              type="number"
                              value={editForm.age}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  age: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Your age"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={editForm.number}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  number: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Phone number"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Emergency Type
                            </label>
                            <input
                              type="text"
                              value={editForm.emergency}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  emergency: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Type of emergency"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-2">
                                Latitude
                              </label>
                              <input
                                type="number"
                                value={editForm.latitude}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    latitude: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Latitude"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-2">
                                Longitude
                              </label>
                              <input
                                type="number"
                                value={editForm.longitude}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    longitude: e.target.value,
                                  })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Longitude"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleGetLocation}
                            className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 transition-all duration-300 hover:shadow-md"
                          >
                            <Crosshair size={18} />
                            <span>Use My Current Location</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdate(req._id)}
                          className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-6 py-3 font-semibold transition-all duration-300 hover:shadow-lg"
                        >
                          <Save size={18} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal View */
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <AlertTriangle
                                size={24}
                                className="text-blue-600"
                              />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">
                              {req.emergency}
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <User size={18} className="text-gray-600" />
                              <div>
                                <p className="text-gray-500 text-sm">Name</p>
                                <p className="font-semibold text-gray-800">
                                  {req.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <Calendar size={18} className="text-gray-600" />
                              <div>
                                <p className="text-gray-500 text-sm">Age</p>
                                <p className="font-semibold text-gray-800">
                                  {req.age} years
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <Phone size={18} className="text-gray-600" />
                              <div>
                                <p className="text-gray-500 text-sm">Phone</p>
                                <p className="font-semibold text-gray-800">
                                  {req.number}
                                </p>
                              </div>
                            </div>
                          </div>

                          {req.location && (
                            <a
                              href={`https://www.google.com/maps?q=${req.location.latitude},${req.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 transition-all duration-300 hover:shadow-md border border-blue-200 text-blue-700"
                            >
                              <MapPin size={16} />
                              <span>View Location on Map</span>
                              <Navigation size={14} />
                            </a>
                          )}

                          <p className="text-gray-500 text-sm mt-4 flex items-center gap-2">
                            <Calendar size={14} />
                            Created: {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadPDF(req)}
                            className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-300 hover:scale-110 border border-green-200 text-green-700"
                            title="Download PDF"
                          >
                            <Download size={20} />
                          </button>
                          <button
                            onClick={() => handleEdit(req)}
                            className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110 border border-blue-200 text-blue-700"
                            title="Edit Request"
                          >
                            <Edit3 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-110 border border-red-200 text-red-700"
                            title="Delete Request"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render profile content
  const renderProfile = () => (
    <main className="flex-1 p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <UserCircle size={48} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-blue-100 text-lg mt-1">{formData.email}</p>
                <p className="text-blue-100 mt-1">{formData.mobile}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Personal Details */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Personal Details
                </h3>
                <button
                  onClick={() => openEdit("personal")}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">
                      {formData.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {formData.mobile}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(formData.dob)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Details */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Heart size={20} className="text-red-500" />
                  Health Details
                </h3>
                <button
                  onClick={() => openEdit("health")}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium text-gray-800">
                      {formData.blood || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Allergies</p>
                    <p className="font-medium text-gray-800">
                      {formData.allergy || "None"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Medical Conditions</p>
                    <p className="font-medium text-gray-800">
                      {formData.condition || "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium text-gray-800">
                      {formData.emergencyNumber || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl p-3 transition-all duration-300 w-full"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Menu</h2>
          <p className="text-gray-500 text-sm">
            Manage your account and requests
          </p>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-2">
            <button
              onClick={() => setActiveSection("profile")}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 w-full text-left ${
                activeSection === "profile"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <UserCircle size={20} />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveSection("emergencyRequests")}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 w-full text-left ${
                activeSection === "emergencyRequests"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <AlertTriangle size={20} />
              <span className="font-medium">Emergency Requests</span>
            </button>

            <button
              onClick={() => setActiveSection("changePassword")}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 w-full text-left ${
                activeSection === "changePassword"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Lock size={20} />
              <span className="font-medium">Change Password</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      {activeSection === "profile" && renderProfile()}
      {activeSection === "emergencyRequests" && renderEmergencyRequests()}
      {activeSection === "changePassword" && renderChangePassword()}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to sign in again
                to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Edit Form for Profile */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit{" "}
              {editSection === "personal"
                ? "Personal"
                : editSection === "health"
                  ? "Health"
                  : "Emergency"}{" "}
              Details
            </h2>

            {editSection === "personal" && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formatDate(formData.dob) : ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}

            {editSection === "health" && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type
                </label>
                <input
                  type="text"
                  name="blood"
                  value={formData.blood || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergy"
                  value={formData.allergy || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyNumber"
                  value={formData.emergencyNumber || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEdit}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userprofile;
