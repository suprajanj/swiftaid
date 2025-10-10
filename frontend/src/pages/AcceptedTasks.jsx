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
import { Rnd } from "react-rnd";
import { FaUser, FaArrowLeft } from "react-icons/fa";

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

  const [senderNIC, setSenderNIC] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderContactNumber, setSenderContactNumber] = useState("");
  const [senderAddress, setSenderAddress] = useState("");

  const [emergencyType, setEmergencyType] = useState("");
  const [location, setLocation] = useState("");

  const [otherParticipants, setOtherParticipants] = useState("");
  const [otherResponders, setOtherResponders] = useState([]);
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
      navigator.geolocation.watchPosition(
        (pos) => {
          setResponderLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }

    const interval = setInterval(fetchAcceptedTasks, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentTask || !responderLocation || !window.google) return;

    const updateRoute = () => {
      const destination = currentTask.liveLocation?.coordinates;
      if (!destination) return;

      if (!directionsServiceRef.current)
        directionsServiceRef.current = new window.google.maps.DirectionsService();

      directionsServiceRef.current.route(
        {
          origin: responderLocation,
          destination: {
            lat: destination[1],
            lng: destination[0],
          },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          }
        }
      );
    };

    updateRoute();
    const interval = setInterval(updateRoute, 2000);
    return () => clearInterval(interval);
  }, [currentTask, responderLocation]);

  const fetchAcceptedTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/alerts/accepted");
      const fetchedTasks = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const mappedTasks = fetchedTasks.map((task) => ({
        ...task,
        otherResponders: task.assignedResponders?.map((r) => r.name) || [],
      }));

      setTasks(mappedTasks);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      toast.error("Failed to fetch tasks.");
    }
  };

  const reachedTask = async (task) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${task._id}/reached`);
      toast.success(`Task ${task.reportId} marked as reached.`);
      fetchAcceptedTasks();
      setShowCompleteForm(true);
      setCurrentTask(task);
      setShowCancelForm(false);

      setCompletedBy(task.assignedResponders?.[0]?.name || "");
      setPosition(task.assignedResponders?.[0]?.position || "");
      setNIC(task.assignedResponders?.[0]?.NIC || "");
      setContactNumber(task.assignedResponders?.[0]?.contactNumber || "");
      setEmergencyType(task.emergencyType);
      setLocation(task.address);
      setSenderNIC(task.NIC || "");
      setSenderName(task.userId || "");
      setSenderContactNumber(task.contactNumber || "");
      setSenderAddress(task.address || "");
      setOtherResponders(task.assignedResponders?.map((r) => r.name) || []);
    } catch (err) {
      console.error("Reached Task Error:", err);
      toast.error("Failed to update task status.");
    }
  };

  const generateCompletionPDF = (task) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SwiftAid Task Completion Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Report ID: ${task.reportId}`, 20, 35);
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
    doc.text(`Other Responders: ${otherResponders.join(", ")}`, 20, 155);
    doc.text(`Casualties: ${casualties}`, 20, 165);
    doc.text(`Critical Injuries: ${criticalInjuries}`, 20, 175);
    doc.text(`Fatalities: ${fatalities}`, 20, 185);
    doc.text(`Total Victims: ${totalVictims}`, 20, 195);
    doc.text(`Comment: ${comment}`, 20, 205);
    doc.save(`Task_${task.reportId}.pdf`);
  };

  const completeTask = async (taskId) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      formData.append("completedBy", completedBy);
      formData.append("position", position);
      formData.append("NIC", NIC);
      formData.append("contactNumber", contactNumber);
      formData.append("emergencyType", emergencyType);
      formData.append("location", location);
      formData.append("senderNIC", senderNIC);
      formData.append("senderName", senderName);
      formData.append("senderContactNumber", senderContactNumber);
      formData.append("senderAddress", senderAddress);
      formData.append("otherParticipants", otherParticipants);
      formData.append("otherResponders", JSON.stringify(otherResponders));
      formData.append("casualties", casualties);
      formData.append("fatalities", fatalities);
      formData.append("criticalInjuries", criticalInjuries);
      formData.append("totalVictims", totalVictims);
      formData.append("comment", comment);

      const task = tasks.find((t) => t._id === taskId);

      await axios.post(
        `http://localhost:3000/api/alerts/${taskId}/completeWithDetails`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      generateCompletionPDF(task);
      toast.success("Task completed successfully!");
      setShowCompleteForm(false);
      resetForm();
      setCurrentTask(null);
      fetchAcceptedTasks();
    } catch (err) {
      console.error("Complete Task Error:", err.response || err);
      toast.error("Failed to complete task.");
    }
  };

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

  const passDataToRequestDonations = async (task) => {
    try {
      await axios.post("http://localhost:3000/api/alerts/requestDonations", {
        reportId: task.reportId,
        emergencyType: task.emergencyType,
      });
      navigate("/request-donations", { state: { task } });
    } catch (err) {
      console.error("Request Donations Error:", err.response || err);
      toast.error("Failed to request donations.");
    }
  };

  const openRouteMap = (task) => setCurrentTask(task);

  const handleReasonChange = (reason) =>
    setCancelReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );

  const resetForm = () => {
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
    setOtherResponders([]);
    setCasualties("");
    setFatalities("");
    setCriticalInjuries("");
    setTotalVictims("");
  };

  if (loadError) return <p>Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
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

      {/* COMPLETE TASK FORM */}
      {showCompleteForm && currentTask && (
        <div className="bg-white shadow-xl rounded-xl p-4 mb-4 border animate-fadeIn">
          <h2 className="text-lg font-bold mb-2">
            Complete Task: {currentTask.reportId}
          </h2>

          {/* Inputs */}
          {[
            { label: "Your Name", value: completedBy, setter: setCompletedBy },
            { label: "Position", value: position, setter: setPosition },
            { label: "NIC", value: NIC, setter: setNIC },
            { label: "Contact Number", value: contactNumber, setter: setContactNumber },
            { label: "Emergency Type", value: emergencyType, setter: setEmergencyType },
            { label: "Location", value: location, setter: setLocation },
            { label: "Sender Name", value: senderName, setter: setSenderName },
            { label: "Sender NIC", value: senderNIC, setter: setSenderNIC },
            { label: "Sender Contact", value: senderContactNumber, setter: setSenderContactNumber },
            { label: "Sender Address", value: senderAddress, setter: setSenderAddress },
            { label: "Other Participants", value: otherParticipants, setter: setOtherParticipants },
            { label: "Other Responders", value: otherResponders.join(", "), setter: (val) => setOtherResponders(val.split(",").map(r => r.trim())) },
            { label: "Casualties", value: casualties, setter: setCasualties, type: "number" },
            { label: "Critical Injuries", value: criticalInjuries, setter: setCriticalInjuries, type: "number" },
            { label: "Fatalities", value: fatalities, setter: setFatalities, type: "number" },
            { label: "Total Victims", value: totalVictims, setter: setTotalVictims, type: "number" },
          ].map(({ label, value, setter, type }, idx) => (
            <input
              key={idx}
              type={type || "text"}
              placeholder={label}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="mb-2 border p-1 w-full"
            />
          ))}

          <textarea
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-2 border p-1 w-full"
          />

          <p className="text-sm mb-2">Add Files (photos/videos):</p>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mb-2"
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

      {/* CANCEL FORM */}
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

      {/* TASKS TABLE */}
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
                <td className="px-4 py-2 text-sm">{task._id}</td>
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
                        onClick={() => openRouteMap(task)}
                      >
                        View Route
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition"
                        onClick={() => setShowCancelForm(true) || setCurrentTask(task)}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition"
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

      {/* ROUTE MAP MODAL */}
      {currentTask && (
        <Rnd
          default={{
            x: 50,
            y: 50,
            width: 600,
            height: 400,
          }}
          bounds="window"
          className="z-50 border rounded shadow-lg bg-white"
        >
          <div className="flex justify-between items-center p-2 border-b">
            <h3 className="font-bold">Route to {currentTask.reportId}</h3>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              onClick={() => setCurrentTask(null)}
            >
              Close
            </button>
          </div>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={responderLocation || { lat: 0, lng: 0 }}
            zoom={13}
            options={{ styles: mapStyles }}
          >
            {responderLocation && <MarkerF position={responderLocation} />}
            {currentTask.liveLocation && (
              <MarkerF
                position={{
                  lat: currentTask.liveLocation.coordinates[1],
                  lng: currentTask.liveLocation.coordinates[0],
                }}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </Rnd>
      )}
    </div>
  );
}
