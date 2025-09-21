// frontend/src/NotificationDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts", { timeout: 5000 });
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
        setError(null);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching alerts:", err.message);
      setError("Failed to fetch alerts. Please try again.");
    }
  };

  const acceptAlert = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${id}/accept`);
      fetchAlerts();
    } catch (err) {
      console.error("Error accepting alert:", err.message);
      setError("Failed to accept alert. Please try again.");
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Emergency Alerts</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        onClick={() => navigate("/accepted-tasks")}
      >
        View Accepted Tasks
      </button>
      {alerts.length === 0 && !error && <p className="text-gray-500">No active alerts</p>}
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert.reportId}
            className="border p-3 rounded-lg"
          >
            <p className="font-semibold">{alert.emergencyType?.toUpperCase() || "Unknown"}</p>
            <p className="text-sm text-gray-600">{alert.address || "No address provided"}</p>
            <p className="text-xs mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 inline-block rounded">
              {alert.status || "Unknown"}
            </p>
            <button
              className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded mt-2 ml-2"
              onClick={() => acceptAlert(alert._id)}
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}