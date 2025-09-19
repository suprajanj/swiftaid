import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResourceRequests from "./ResourceRequests.jsx";
import Donations from "./Donations.jsx";
import ResourceDashboard from "./ResourceDashboard.jsx";

export default function App() {
  const [status, setStatus] = useState("Loading system status...");

  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "Running") {
          setStatus("✅ Backend server running on port 3000. MongoDB connected successfully.");
        } else {
          setStatus("❌ Backend server not reachable");
        }
      })
      .catch(() => setStatus("❌ Backend server not reachable"));
  }, []);

  return (
    <Router>
      <div style={{ background: "#111", color: "#fff", minHeight: "100vh" }}>
        {/* Status banner */}
        <div style={{
          background: "#222",
          padding: "10px 20px",
          color: "#aaa",
          fontSize: "0.9rem"
        }}>
          <strong>System Status:</strong> {status}
        </div>

        <Routes>
          <Route path="/" element={<ResourceDashboard />} />
          <Route path="/resources" element={<ResourceRequests />} />
          <Route path="/donations" element={<Donations />} />
        </Routes>
      </div>
    </Router>
  );
}
