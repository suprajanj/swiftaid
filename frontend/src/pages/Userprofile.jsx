// ProfilePage.jsx
import React, { useState } from "react";
import { Bell, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Userprofile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dob: "1990-05-15",
    bloodType: "O+",
    allergies: "Peanuts, Shellfish",
    conditions: "None",
  });

  const openEdit = (section) => {
    setEditSection(section);
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditSection(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Updated:", formData);
    closeEdit();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md p-4 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/homepage")}
          className="flex items-center gap-2 p-2 mb-4 text-gray-700 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        {/* Profile heading */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile</h2>

        {/* Notifications button */}
        <button className="flex items-center gap-2 p-2 mb-6 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
          <Bell size={20} />
          Notifications
        </button>

        {/* Sidebar buttons */}
        <div className="flex flex-col gap-3 flex-grow">
          <button
            onClick={() => navigate("/userRequests")}
            className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left"
          >
            View My Emergency Requests
          </button>
          <button className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left">
            Button 2
          </button>
          <button className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left">
            Button 3
          </button>
          <button className="p-2 text-gray-700 hover:bg-gray-200 rounded text-left">
            Button 4
          </button>
        </div>

        {/* Logout button */}
        <button className="flex items-center gap-2 p-2 mt-6 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
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
            <h2 className="text-xl font-semibold mt-3">{formData.fullName}</h2>
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
                {formData.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {formData.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {formData.phone}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{" "}
                {formData.dob}
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
                {formData.bloodType}
              </p>
              <p>
                <span className="font-medium">Allergies:</span>{" "}
                {formData.allergies}
              </p>
              <p>
                <span className="font-medium">Medical Conditions:</span>{" "}
                {formData.conditions}
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
              Edit {editSection === "personal" ? "Personal" : "Health"} Details
            </h2>

            {editSection === "personal" && (
              <>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full border p-2 rounded mb-3"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border p-2 rounded mb-3"
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full border p-2 rounded mb-3"
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mb-3"
                />
              </>
            )}

            {editSection === "health" && (
              <>
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  placeholder="Blood Type"
                  className="w-full border p-2 rounded mb-3"
                />
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Allergies"
                  className="w-full border p-2 rounded mb-3"
                />
                <input
                  type="text"
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleChange}
                  placeholder="Medical Conditions"
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
