import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResponderLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/responder-login", {
        email,
        password,
      });
      localStorage.setItem("responderToken", response.data.token);
      toast.success("Login successful!");
      navigate("/notifications");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 transform transition duration-300 hover:scale-[1.01]">
        <h2 className="text-center text-3xl font-extrabold text-blue-700 mb-6">
          🔑 Responder Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="responder@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform transition active:scale-95"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <button
            onClick={() => navigate("/")}
            className="hover:underline font-medium"
          >
            🏠 Home
          </button>
          <button
            onClick={() => toast.info("Forgot password flow coming soon")}
            className="hover:underline font-medium"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-4 text-center text-white text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/create-police-responder")}
            className="text-white font-semibold cursor-pointer hover:underline"
          >
            Create New
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResponderLogin;
