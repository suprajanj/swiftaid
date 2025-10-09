// src/AcceptedTasks.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import mapStyles from "./mapStyles.jsx";
import jsPDF from "jspdf";
import { FaUser, FaArrowLeft } from "react-icons/fa";

const API = "http://127.0.0.1:3000/api";
const libraries = ["places"];

export default function AcceptedTasks() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  // Form states
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState("");
  const [completedBy, setCompletedBy] = useState("");
  const [position, setPosition] = useState("");
  const [NIC, setNIC] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyType, setEmergencyType] = useState("");
  const [location, setLocation] = useState("");
  const [senderNIC, setSenderNIC] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderContactNumber, setSenderContactNumber] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [otherParticipants, setOtherParticipants] = useState("");
  const [otherResponders, setOtherResponders] = useState([{ name: "", NIC: "" }]);
  const [casualties, setCasualties] = useState("");
  const [fatalities, setFatalities] = useState("");
  const [criticalInjuries, setCriticalInjuries] = useState("");
  const [totalVictims, setTotalVictims] = useState("");
  const [cancelReasons, setCancelReasons] = useState([]);

  const [responderLocation, setResponderLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const directionsServiceRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAcceptedTasks();

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setResponderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchAcceptedTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentTask || !responderLocation || !window.google) return;

    const updateRoute = () => {
      const destinationCoords =
        currentTask.location?.coordinates ||
        (currentTask.location && [currentTask.location.longitude, currentTask.location.latitude]);
      if (!destinationCoords) return;

      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
      }

      directionsServiceRef.current.route(
        {
          origin: responderLocation,
          destination: { lat: destinationCoords[1], lng: destinationCoords[0] },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") setDirections(result);
        }
      );
    };

    updateRoute();
    const iv = setInterval(updateRoute, 3000);
    return () => clearInterval(iv);
  }, [currentTask, responderLocation]);

  // Fetch tasks
  async function fetchAcceptedTasks() {
    try {
      const responder = JSON.parse(localStorage.getItem("responder"));
      if (!responder?._id) return;

      const res = await axios.get(`${API}/accepted-alerts/${responder._id}`);
      const fetched = Array.isArray(res.data) ? res.data : res.data.data || [];

      const relevant = fetched.filter(
        (task) =>
          ["accepted", "reached"].includes(String(task.status).toLowerCase()) &&
          Array.isArray(task.acceptedBy) &&
          task.acceptedBy.some((r) => String(r._id) === String(responder._id))
      );

      const mapped = relevant.map((task) => ({
        ...task,
        otherResponders: (task.acceptedBy || [])
          .filter((r) => String(r._id) !== String(responder._id))
          .map((r) => ({ name: r.name || "", NIC: r.NIC || "", _id: r._id })),
      }));

      setTasks(mapped);
    } catch (err) {
      console.error("Fetch accepted tasks:", err);
      toast.error("Failed to fetch accepted tasks");
    }
  }

  // Mark as reached
  async function markAsReached(task) {
    try {
      await axios.put(`${API}/alerts/${task._id}/reached`);
      toast.success("Marked as reached");
      fetchAcceptedTasks();
      setCurrentTask(task);
      setShowCompleteForm(true);
      setShowCancelForm(false);
      prefillCompleteForm(task);
    } catch (err) {
      console.error("markAsReached error:", err);
      toast.error("Failed to mark as reached");
    }
  }

  // Cancel
  async function cancelTask(taskId) {
    try {
      await axios.put(`${API}/alerts/${taskId}/cancel`, { reasons: cancelReasons });
      toast.success("Task cancelled");
      setShowCancelForm(false);
      setCancelReasons([]);
      setCurrentTask(null);
      fetchAcceptedTasks();
    } catch (err) {
      console.error("cancelTask error:", err);
      toast.error("Failed to cancel task");
    }
  }

  // Complete task with PDF generation
  async function completeTask(taskId) {
    try {
      const form = new FormData();
      form.append("reportId", currentTask.reportId || currentTask._id);
      form.append("completedBy", completedBy);
      form.append("position", position);
      form.append("NIC", NIC);
      form.append("contactNumber", contactNumber);
      form.append("emergencyType", emergencyType);
      form.append("location", location);
      form.append("senderName", senderName);
      form.append("senderNIC", senderNIC);
      form.append("senderContactNumber", senderContactNumber);
      form.append("senderAddress", senderAddress);
      form.append("otherParticipants", otherParticipants);
      form.append("otherResponders", JSON.stringify(otherResponders));
      form.append("casualties", casualties);
      form.append("fatalities", fatalities);
      form.append("criticalInjuries", criticalInjuries);
      form.append("totalVictims", totalVictims);
      form.append("comment", comment);

      if (files && files.length) {
        Array.from(files).forEach((f) => form.append("files", f));
      }

      await axios.post(`${API}/alerts/${taskId}/complete`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Task completed");
      generateCompletionPDF(currentTask);
      setShowCompleteForm(false);
      setCurrentTask(null);
      resetForm();
      fetchAcceptedTasks();
    } catch (err) {
      console.error("completeTask error:", err);
      toast.error("Failed to complete task");
    }
  }

  function handleReasonChange(reason) {
    setCancelReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  // Other responders helpers
  function addOtherResponder() {
    setOtherResponders((prev) => [...prev, { name: "", NIC: "" }]);
  }
  function updateOtherResponder(idx, key, value) {
    setOtherResponders((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }
  function removeOtherResponder(idx) {
    setOtherResponders((prev) => prev.filter((_, i) => i !== idx));
  }

  // Prefill complete form
  function prefillCompleteForm(task) {
    const localResponder = JSON.parse(localStorage.getItem("responder"));
    setCompletedBy(localResponder?.name || task.assignedResponders?.[0]?.name || "");
    setPosition(task.assignedResponders?.[0]?.position || "");
    setNIC(task.assignedResponders?.[0]?.NIC || "");
    setContactNumber(task.assignedResponders?.[0]?.contactNumber || "");
    setEmergencyType(task.emergencyType || task.emergency || "");
    setLocation(task.address || (task.location && task.location.mapLink) || "");
    setSenderName(task.userId || "");
    setSenderNIC(task.NIC || "");
    setSenderContactNumber(task.contactNumber || "");
    setSenderAddress(task.address || "");
    setOtherResponders(task.otherResponders.length ? task.otherResponders : [{ name: "", NIC: "" }]);
  }

  function resetForm() {
    setFiles([]);
    setComment("");
    setCompletedBy("");
    setPosition("");
    setNIC("");
    setContactNumber("");
    setEmergencyType("");
    setLocation("");
    setSenderNIC("");
    setSenderName("");
    setSenderContactNumber("");
    setSenderAddress("");
    setOtherParticipants("");
    setOtherResponders([{ name: "", NIC: "" }]);
    setCasualties("");
    setFatalities("");
    setCriticalInjuries("");
    setTotalVictims("");
  }

  // PDF generation
  function generateCompletionPDF(task) {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("SwiftAid Task Completion Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Report ID: ${task.reportId || task._id}`, 20, 35);
      doc.text(`Responder: ${completedBy}`, 20, 45);
      doc.text(`Position: ${position}`, 20, 55);
      doc.text(`NIC: ${NIC}`, 20, 65);
      doc.text(`Contact: ${contactNumber}`, 20, 75);
      doc.text(`Emergency Type: ${emergencyType}`, 20, 85);
      doc.text(`Location: ${location}`, 20, 95);
      doc.text(`Sender: ${senderName}`, 20, 105);
      doc.text(`Sender NIC: ${senderNIC}`, 20, 115);
      doc.text(`Sender Contact: ${senderContactNumber}`, 20, 125);
      doc.text(`Sender Address: ${senderAddress}`, 20, 135);
      doc.text(`Other Participants: ${otherParticipants}`, 20, 145);
      doc.text(
        `Other Responders: ${otherResponders.map((r) => `${r.name} (${r.NIC})`).join(", ")}`,
        20,
        155
      );
      doc.text(`Casualties: ${casualties}`, 20, 165);
      doc.text(`Critical Injuries: ${criticalInjuries}`, 20, 175);
      doc.text(`Fatalities: ${fatalities}`, 20, 185);
      doc.text(`Total Victims: ${totalVictims}`, 20, 195);
      doc.text(`Comment: ${comment}`, 20, 205);
      doc.save(`Task_${task.reportId || task._id}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    }
  }

  // Request donations (optional)
  async function passDataToRequestDonations(task) {
    try {
      await axios.post(`${API}/alerts/requestDonations`, {
        reportId: task.reportId,
        emergencyType: task.emergencyType,
      });
      navigate("/request-donations", { state: { task } });
    } catch (err) {
      console.error("Request donations error:", err);
      toast.error("Failed to request donations.");
    }
  }

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center gap-2 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-primary">✅ Accepted Tasks</h1>
        <FaUser className="text-2xl text-gray-700" />
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto bg-white shadow-xl rounded-xl border mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Report ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Emergency</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm">{task.reportId || task._id}</td>
                <td className="px-4 py-2 text-sm">{task.emergencyType || task.emergency || "N/A"}</td>
                <td className="px-4 py-2 text-sm">
                  {task.address || (task.location && `${task.location.latitude}, ${task.location.longitude}`) || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm font-semibold">{(task.status || "").toLowerCase()}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {String(task.status).toLowerCase() === "accepted" && (
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                        onClick={() => markAsReached(task)}
                      >
                        Mark as Reached
                      </button>
                    )}

                    {String(task.status).toLowerCase() === "reached" && (
                      <>
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                          onClick={() => {
                            setCurrentTask(task);
                            setShowCompleteForm(false);
                            setShowCancelForm(false);
                          }}
                        >
                          View Route
                        </button>

                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                          onClick={() => {
                            setCurrentTask(task);
                            setShowCompleteForm(true);
                            setShowCancelForm(false);
                            prefillCompleteForm(task);
                          }}
                        >
                          Complete
                        </button>

                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                          onClick={() => {
                            setCurrentTask(task);
                            setShowCancelForm(true);
                            setShowCompleteForm(false);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {["completed", "cancelled"].includes(String(task.status).toLowerCase()) && (
                      <span
                        className={`text-sm font-semibold ${
                          String(task.status).toLowerCase() === "completed" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {String(task.status).toLowerCase() === "completed" ? "✅ Completed" : "❌ Cancelled"}
                      </span>
                    )}

                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg"
                      onClick={() => passDataToRequestDonations(task)}
                    >
                      Request Donations
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPLETE FORM */}
      {showCompleteForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border">
          <h2 className="text-lg font-bold mb-2">Complete Task: {currentTask.reportId || currentTask._id}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} placeholder="Your name" className="border p-2" />
            <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" className="border p-2" />
            <input value={NIC} onChange={(e) => setNIC(e.target.value)} placeholder="NIC" className="border p-2" />
            <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Contact Number" className="border p-2" />
            <input value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} placeholder="Emergency Type" className="border p-2" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="border p-2" />
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Sender Name" className="border p-2" />
            <input value={senderNIC} onChange={(e) => setSenderNIC(e.target.value)} placeholder="Sender NIC" className="border p-2" />
            <input value={senderContactNumber} onChange={(e) => setSenderContactNumber(e.target.value)} placeholder="Sender Contact" className="border p-2" />
            <input value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="Sender Address" className="border p-2" />
            <input value={otherParticipants} onChange={(e) => setOtherParticipants(e.target.value)} placeholder="Other Participants" className="border p-2" />
            <input value={casualties} onChange={(e) => setCasualties(e.target.value)} placeholder="Casualties" className="border p-2" />
            <input value={criticalInjuries} onChange={(e) => setCriticalInjuries(e.target.value)} placeholder="Critical Injuries" className="border p-2" />
            <input value={fatalities} onChange={(e) => setFatalities(e.target.value)} placeholder="Fatalities" className="border p-2" />
            <input value={totalVictims} onChange={(e) => setTotalVictims(e.target.value)} placeholder="Total Victims" className="border p-2" />
          </div>

          <div className="mt-3">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comments" className="border p-2 w-full"></textarea>
          </div>

          <div className="mt-3">
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="border p-2 w-full" />
          </div>

          <div className="mt-3 flex gap-3">
            <button onClick={() => completeTask(currentTask._id)} className="bg-green-600 text-white px-3 py-1 rounded-lg">
              Submit
            </button>
            <button
              onClick={() => {
                setShowCompleteForm(false);
                resetForm();
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CANCEL FORM */}
      {showCancelForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border">
          <h2 className="text-lg font-bold mb-2">Cancel Task: {currentTask.reportId || currentTask._id}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["Unable to reach location", "No resources", "Emergency resolved", "Other"].map((reason) => (
              <label key={reason} className="flex items-center gap-2">
                <input type="checkbox" checked={cancelReasons.includes(reason)} onChange={() => handleReasonChange(reason)} />
                {reason}
              </label>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            <button onClick={() => cancelTask(currentTask._id)} className="bg-red-600 text-white px-3 py-1 rounded-lg">
              Submit
            </button>
            <button
              onClick={() => {
                setShowCancelForm(false);
                setCancelReasons([]);
              }}
              className="bg-gray-400 text-white px-3 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Google Map */}
      <div className="w-full h-[400px] rounded-xl overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={responderLocation || { lat: 7.8731, lng: 80.7718 }}
          zoom={8}
          options={{ styles: mapStyles }}
        >
          {responderLocation && <MarkerF position={responderLocation} label="You" />}
          {currentTask?.location?.coordinates && (
            <MarkerF
              position={{
                lat: currentTask.location.coordinates[1],
                lng: currentTask.location.coordinates[0],
              }}
              label="Task"
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
}
