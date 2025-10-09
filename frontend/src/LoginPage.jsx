import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [NICOrEmail, setNICOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Admin credential list
  const adminCredentials = [
    {
      email: "mainresponderhandler@firefighter.com",
      password: "firefighter#123",
      route: "/create-firefighter-responder",
    },
    {
      email: "mainresponderhandler@medical.com",
      password: "medical#123",
      route: "/create-hospital-responder",
    },
    {
      email: "mainresponderhandler@police.com",
      password: "police#123",
      route: "/create-police-responder",
    },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("responder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed._id && parsed.NIC) {
          navigate("/notifications");
        } else {
          localStorage.removeItem("responder");
        }
      } catch {
        localStorage.removeItem("responder");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const input = NICOrEmail.trim();
    const pass = password.trim();

    if (!input || !pass) {
      toast.error("Please enter both NIC/email and password");
      return;
    }

    // 🔹 Admin login check
    const adminUser = adminCredentials.find(
      (c) => c.email === input && c.password === pass
    );
    if (adminUser) {
      toast.success("Admin login successful!");
      setTimeout(() => navigate(adminUser.route), 1200);
      return;
    }

    try {
      setLoading(true);
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      // 🔹 Detect NIC or email
      const payload = input.includes("@")
        ? { email: input, password: pass }
        : { NIC: input, password: pass };

      const res = await axios.post(`${BACKEND_URL}/api/responders/login`, payload);

      if (!res.data?.responder) {
        toast.error(res.data?.message || "Invalid credentials");
        return;
      }

      const responder = res.data.responder;

      // 🔹 Update responder status
      await axios.patch(`${BACKEND_URL}/api/responders/${responder._id}/status`, {
        status: "active",
      });

      // ✅ Update responder location once after login
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

            try {
              await axios.patch(
                `${BACKEND_URL}/api/responders/${responder._id}/location`,
                { latitude, longitude, mapLink }
              );
              console.log("📍 Location updated after login:", latitude, longitude);
            } catch (locErr) {
              console.error("❌ Failed to update location:", locErr);
            }
          },
          (err) => console.warn("⚠️ Location permission denied:", err),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        console.warn("⚠️ Geolocation not supported in this browser.");
      }

      // 🔹 Save responder info locally
      const updatedResponder = { ...responder, status: "active" };
      localStorage.setItem("responder", JSON.stringify(updatedResponder));
      localStorage.setItem("responderId", responder._id);

      toast.success("Responder login successful!");

      // 🔹 Redirect
      setTimeout(() => {
        if (responder.role === "responder") navigate("/accepted-tasks");
        else navigate("/notifications");
      }, 1200);
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || "Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-500 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-indigo-700 mb-6">
          🔑 Responder Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Email / NIC</label>
            <input
              type="text"
              placeholder="Enter your NIC or admin email"
              value={NICOrEmail}
              onChange={(e) => setNICOrEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/4 transform -translate-y-2/4 cursor-pointer text-gray-500 font-semibold select-none"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
