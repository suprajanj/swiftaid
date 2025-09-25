// src/AcceptedTasks.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom"; // ✅ added
import "react-toastify/dist/ReactToastify.css";
import mapStyles from "./mapStyles.jsx";

const mapContainerStyle = { width: "100%", height: "60vh" };
const libraries = ["places"];

export default function AcceptedTasks() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [cancelReasons, setCancelReasons] = useState([]);
  const [responderLocation, setResponderLocation] = useState(null);
  const [directions, setDirections] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const navigate = useNavigate();

  // Fetch tasks every 10 seconds
  useEffect(() => {
    fetchAcceptedTasks();

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        setResponderLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }

    const interval = setInterval(fetchAcceptedTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAcceptedTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted");
      setTasks(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks.");
    }
  };

  // Mark as reached
  const reachedTask = async (task) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${task._id}/reached`);
      toast.success(`Task ${task.reportId} marked as reached.`);
      fetchAcceptedTasks();
      setShowCompleteForm(true);
      setCurrentTask(task);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task status.");
    }
  };

  // Complete task
  const completeTask = async (taskId) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      formData.append("comment", comment);

      await axios.put(
        `http://localhost:3000/api/alerts/${taskId}/complete`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Task completed successfully!");
      setShowCompleteForm(false);
      setFiles([]);
      setComment("");
      setCurrentTask(null);
      fetchAcceptedTasks();
    } catch (err) {
      console.error("Complete Task Error:", err.response || err);
      toast.error("Failed to complete task.");
    }
  };

  // Cancel task
  const cancelTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${taskId}/cancel`, {
        reasons: cancelReasons,
      });
      toast.success("Task cancelled successfully.");
      setShowCancelForm(false);
      setCancelReasons([]);
      setCurrentTask(null);
      fetchAcceptedTasks();
    } catch (err) {
      console.error("Cancel Task Error:", err.response || err);
      toast.error("Failed to cancel task.");
    }
  };

  // Request donations
  const passDataToRequestDonations = async (task) => {
    try {
      await axios.post("http://localhost:3000/api/alerts/requestDonations", {
        reportId: task.reportId,
        emergencyType: task.emergencyType,
      });
      navigate("/request-donations", { state: { task } }); // ✅ navigate after posting
    } catch (err) {
      console.error("Request Donations Error:", err.response || err);
      toast.error("Failed to request donations.");
    }
  };

  // Show route to task
  const openRouteMap = (task) => {
    setCurrentTask(task);
    if (responderLocation && task.liveLocation?.coordinates) {
      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: responderLocation,
          destination: {
            lat: task.liveLocation.coordinates[1],
            lng: task.liveLocation.coordinates[0],
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.error("Directions error:", status);
            toast.error("Failed to calculate route: " + status);
          }
        }
      );
    }
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  // Handle cancel reason checkbox
  const handleReasonChange = (reason) => {
    setCancelReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-4 text-primary">✅ Accepted Tasks</h1>

      {/* Complete Task Form */}
      {showCompleteForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border animate-fadeIn">
          <h2 className="text-lg font-bold mb-2">
            Complete Task: {currentTask.reportId}
          </h2>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mb-2"
          />
          <textarea
            className="w-full border p-2 mb-2 rounded"
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              onClick={() => completeTask(currentTask._id)}
            >
              Submit
            </button>
            <button
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
              onClick={() => setShowCompleteForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel Task Form */}
      {showCancelForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border animate-fadeIn">
          <h2 className="text-lg font-bold mb-2">
            Cancel Task: {currentTask.reportId}
          </h2>
          <p className="text-sm mb-2">Select reasons:</p>
          <div className="flex flex-col gap-2 mb-2">
            {[
              "False alarm",
              "Responder unavailable",
              "Duplicate alert",
              "Other emergency prioritized",
              "Other",
            ].map((reason) => (
              <label key={reason} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cancelReasons.includes(reason)}
                  onChange={() => handleReasonChange(reason)}
                />
                {reason}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              onClick={() => cancelTask(currentTask._id)}
            >
              Confirm Cancel
            </button>
            <button
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
              onClick={() => setShowCancelForm(false)}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border animate-fadeIn">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Report ID
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Emergency
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Address
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm">{task.reportId}</td>
                <td className="px-4 py-2 text-sm">{task.emergencyType}</td>
                <td className="px-4 py-2 text-sm">{task.address}</td>
                <td className="px-4 py-2 text-sm font-semibold">{task.status}</td>
                <td className="px-4 py-2 text-sm space-x-2">
                  {task.status === "accepted" && (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition"
                      onClick={() => reachedTask(task)}
                    >
                      Mark as Reached
                    </button>
                  )}

                  {task.status === "reached" && (
                    <>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition"
                        onClick={() => {
                          setCurrentTask(task);
                          setShowCompleteForm(true);
                        }}
                      >
                        Complete Task
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition"
                        onClick={() => {
                          setCurrentTask(task);
                          setShowCancelForm(true);
                        }}
                      >
                        Cancel Task
                      </button>
                    </>
                  )}

                  {task.status === "completed" && (
                    <span className="text-green-700 font-semibold">
                      Completed ✅
                    </span>
                  )}

                  {task.status === "cancelled" && (
                    <span className="text-red-700 font-semibold">
                      Cancelled ❌
                    </span>
                  )}

                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    onClick={() => openRouteMap(task)}
                  >
                    View Route
                  </button>

                  <button
                    className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition"
                    onClick={() => passDataToRequestDonations(task)}
                  >
                    Request Donations
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Route Map Modal */}
      {currentTask && directions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-3/4 h-3/4 p-4 relative">
            <h2 className="text-lg font-bold mb-2">
              Live Route: {currentTask.reportId}
            </h2>
            <button
              className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600"
              onClick={() => {
                setCurrentTask(null);
                setDirections(null);
              }}
            >
              Close
            </button>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "90%" }}
              center={responderLocation || { lat: 6.9271, lng: 79.8612 }}
              zoom={12}
              options={{ styles: mapStyles }}
            >
              {responderLocation && (
                <MarkerF position={responderLocation} label="🚑" />
              )}
              {currentTask?.liveLocation?.coordinates && (
                <MarkerF
                  position={{
                    lat: currentTask.liveLocation.coordinates[1],
                    lng: currentTask.liveLocation.coordinates[0],
                  }}
                  label="🚨"
                />
              )}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        </div>
      )}
    </div>
  );
}
