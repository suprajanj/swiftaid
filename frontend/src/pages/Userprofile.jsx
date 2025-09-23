// Userprofile.jsx
import React, { useState, useEffect } from "react";
import { Bell, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function Userprofile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
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

  // change this if your API runs elsewhere or use env var
  const BASE_USER_API = "http://localhost:3000/api/user";

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

  // ✅ Save updates (fixed endpoint)
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

      // update local form state with returned user
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
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        const token = localStorage.getItem("token");
        // send token too (server doesn't require it now, but good practice)
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
    }
  };

  // ✅ Format DOB for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0]; // YYYY-MM-DD
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md p-4 flex flex-col">
        <button
          onClick={() => navigate("/homepage")}
          className="flex items-center gap-2 p-2 mb-4 text-gray-700 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile</h2>

        <button className="flex items-center gap-2 p-2 mb-6 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
          <Bell size={20} />
          Notifications
        </button>

        <div className="flex flex-col gap-3 flex-grow">
          <button
            onClick={() => navigate("/userRequests")}
            className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left"
          >
            View My Emergency Requests
          </button>

          {/* New Change Password Button */}
          <button
            onClick={() => navigate("/changePassword")}
            className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left"
          >
            Change Password
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 mt-6 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Profile Section */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold mt-3">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-500">{formData.email}</p>
          </div>

          {/* Personal Details */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              <button
                onClick={() => openEdit("personal")}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <p>
                <span className="font-medium">Full Name:</span>{" "}
                {formData.firstName} {formData.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {formData.mobile}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{" "}
                {formatDate(formData.dob)}
              </p>
            </div>
          </div>

          {/* Health Details */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Health Details</h3>
              <button
                onClick={() => openEdit("health")}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <p>
                <span className="font-medium">Blood Type:</span>{" "}
                {formData.blood}
              </p>
              <p>
                <span className="font-medium">Allergies:</span>{" "}
                {formData.allergy}
              </p>
              <p>
                <span className="font-medium">Medical Conditions:</span>{" "}
                {formData.condition}
              </p>
              <p>
                <span className="font-medium">Emergency Contact:</span>{" "}
                {formData.emergencyNumber}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay Edit Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
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
                <label className="block mb-1 font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="number"
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formatDate(formData.dob) : ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />
              </>
            )}

            {editSection === "health" && (
              <>
                <label className="block mb-1 font-medium">Blood Type</label>
                <input
                  type="text"
                  name="blood"
                  value={formData.blood || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">Allergies</label>
                <input
                  type="text"
                  name="allergy"
                  value={formData.allergy || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">
                  Medical Conditions
                </label>
                <input
                  type="text"
                  name="condition"
                  value={formData.condition || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />

                <label className="block mb-1 font-medium">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyNumber"
                  value={formData.emergencyNumber || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />
              </>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeEdit}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default Userprofile;
