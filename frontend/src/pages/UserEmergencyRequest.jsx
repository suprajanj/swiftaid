import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

function UserEmergencyRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Initialize navigate

  // Fetch SOS requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/sos");
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching SOS requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Delete request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/sos/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
    } catch (error) {
      console.error("Error deleting SOS request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:bg-gray-200 rounded-lg p-2 transition"
      >
        <ArrowLeft size={20} /> Back to Profile
      </button>

      <h1 className="text-3xl font-bold mb-6">My Emergency Requests</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-gray-600" size={40} />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 text-center">
          No emergency requests found.
        </p>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {req.emergency}
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">Name:</span> {req.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Age:</span> {req.age}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Phone:</span> {req.number}
                </p>
                <a
                  href={req.location?.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
                >
                  <MapPin size={16} /> View Location
                </a>
                <p className="text-gray-500 text-sm mt-1">
                  Created: {new Date(req.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(req._id)}
                className="text-red-600 hover:bg-red-100 p-2 rounded-full"
                title="Delete Request"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserEmergencyRequest;
