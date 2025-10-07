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

  const adminCredentials = [
    { email: "mainresponderhandler@firefighter.com", password: "firefighter#123", route: "/create-firefighter-responder" },
    { email: "mainresponderhandler@medical.com", password: "medical#123", route: "/create-hospital-responder" },
    { email: "mainresponderhandler@police.com", password: "police#123", route: "/create-police-responder" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("responder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.NIC && parsed._id) navigate("/notifications");
        else localStorage.removeItem("responder");
      } catch {
        localStorage.removeItem("responder");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const input = NICOrEmail.trim();
    if (!input || !password.trim()) {
      toast.error("Please enter your NIC/email and password");
      return;
    }

    // Admin login check
    const adminUser = adminCredentials.find((c) => c.email === input && c.password === password);
    if (adminUser) {
      toast.success("Admin login successful!");
      navigate(adminUser.route);
      return;
    }

    try {
      setLoading(true);

      // Responder login
      const res = await axios.post("http://localhost:3000/api/responders/login", { email: input, password });
      const responder = res.data?.responder;

      if (responder?.email) {
        // Update responder status to active
        await axios.put(`http://localhost:3000/api/responders/${responder._id}/status`, { status: "active" });

        const updatedResponder = { ...responder, status: "active" };
        localStorage.setItem("responder", JSON.stringify(updatedResponder));

        toast.success("Responder login successful!");
        navigate("/notifications");
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Responder login error:", err);
      toast.error(err.response?.data?.message || "Server error. Check backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-500 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-indigo-700 mb-6">🔑 Responder Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">NIC or Admin Email</label>
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
            className={`w-full py-2 mt-4 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
