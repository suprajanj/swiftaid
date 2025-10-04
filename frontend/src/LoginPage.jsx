import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/api/login", { email, password }) // ✅ backend port 3000
      .then((res) => {
        toast.success("✅ Login Successful!");

        // Save responder info in localStorage
        localStorage.setItem("responder", JSON.stringify(res.data.responder));

        // Redirect to dashboard
        navigate("/notifications");
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Invalid credentials");
      });
  };

  return (
    <div className="container mt-10 p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="mb-6 text-center text-3xl font-bold text-indigo-600">
        Responder Login
      </h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="responder@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 mt-4 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
