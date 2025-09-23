import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }

      // ✅ Call protected change-password API
      const res = await axios.put(
        "http://localhost:3000/api/user/change-password",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Success message
      toast.success(res.data.message, { duration: 3000 });

      // ✅ Remove token to force logout after password change
      localStorage.removeItem("token");

      // ✅ Redirect to login page
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Password change failed";
      toast.error(msg);
      console.error("Change password error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster position="top-right" />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <label className="block mb-1">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <label className="block mb-1">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <label className="block mb-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
