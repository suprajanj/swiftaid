import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import mapStyles from "./mapStyles.jsx";

const mapContainerStyle = { width: "100%", height: "60vh" };
const libraries = ["places"];

export default function AcceptedTasks() {
  const [tasks, setTasks] = useState([]);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [mapTask, setMapTask] = useState(null); // task for live map
  const [responderLocations, setResponderLocations] = useState([]);
  const [files, setFiles] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    fetchAcceptedTasks();
    const interval = setInterval(fetchAcceptedTasks, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchAcceptedTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted");
      setTasks(res.data.data); // FIX: assign the array from backend
    } catch (err) {
      console.error("Error fetching accepted tasks:", err);
    }
  };

  const cancelTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${taskId}/cancel`);
      fetchAcceptedTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const showCompleteTaskForm = (task) => {
    setCurrentTask(task);
    setShowCompleteForm(true);
  };

  const completeTask = async (taskId) => {
    try {
      const formData = new FormData();
      if (files.length > 0) {
        Array.from(files).forEach((file) => formData.append("files", file));
      }
      formData.append("status", "resolved");
      await axios.put(`http://localhost:3000/api/alerts/${taskId}/complete`, formData);
      setShowCompleteForm(false);
      setFiles([]);
      fetchAcceptedTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const reachedTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${taskId}/reached`);
      fetchAcceptedTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const openRouteMap = async (task) => {
    setMapTask(task);
    try {
      const res = await axios.get(`http://localhost:3000/api/alerts/${task._id}/responders`);
      setResponderLocations(res.data.data || []); // ensure it's an array
    } catch (err) {
      console.error(err);
    }
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-primary">✅ Accepted Tasks</h1>

      {/* Complete Task Form */}
      {showCompleteForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border">
          <h2 className="text-lg font-bold mb-2">Complete Task: {currentTask.reportId}</h2>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mb-2"
          />
          <div>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
              onClick={() => completeTask(currentTask._id)}
            >
              Submit
            </button>
            <button
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
              onClick={() => setShowCompleteForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Report ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Emergency</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Timestamp</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Route</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id}>
                <td className="px-4 py-2 text-sm">{task.reportId}</td>
                <td className="px-4 py-2 text-sm">{task.userId}</td>
                <td className="px-4 py-2 text-sm">{task.emergencyType}</td>
                <td className="px-4 py-2 text-sm">{task.address}</td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      task.status === "accepted"
                        ? "bg-yellow-400"
                        : task.status === "resolved"
                        ? "bg-green-800"
                        : task.status === "cancelled"
                        ? "bg-gray-400"
                        : "bg-red-500"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{new Date(task.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => openRouteMap(task)}
                  >
                    View Route
                  </button>
                </td>
                <td className="px-4 py-2 text-sm space-x-2">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    onClick={() => showCompleteTaskForm(task)}
                  >
                    Complete
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    onClick={() => cancelTask(task._id)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => reachedTask(task._id)}
                  >
                    Reached
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Map Modal for Route */}
      {mapTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-3/4 h-3/4 p-4 relative">
            <h2 className="text-lg font-bold mb-2">Live Route: {mapTask.reportId}</h2>
            <button
              className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600"
              onClick={() => setMapTask(null)}
            >
              Close
            </button>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "90%" }}
              center={responderLocations[0] || { lat: 6.9271, lng: 79.8612 }}
              zoom={12}
              options={{ styles: mapStyles }}
            >
              {responderLocations.map((loc, idx) => (
                <MarkerF key={idx} position={{ lat: loc.lat, lng: loc.lng }} />
              ))}
            </GoogleMap>
          </div>
        </div>
      )}
    </div>
  );
}
