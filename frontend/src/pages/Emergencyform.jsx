import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";

function Emergencyform() {
  const { type } = useParams(); // emergency type from URL
  const navigate = useNavigate(); // for redirect

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    number: "",
    emergencyType: type,
  });

  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBdD_eg0KYT3Lqovnm9FWJVZnWXrOi6klg", // API KEY
  });

  // -------------------- Fetch logged-in user data --------------------
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;

        // Pre-fill form fields
        setFormData((prev) => ({
          ...prev,
          name: `${user.firstName} ${user.lastName}`,
          number: user.mobile,
          age: calculateAge(user.dob),
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user info. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // -------------------- Calculate age from DOB --------------------
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // -------------------- Fetch live GPS location --------------------
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error(error);
          toast.error(
            "Unable to fetch location. Please allow location access."
          );
        }
      );
    }
  }, []);

  // -------------------- Handle form input changes --------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------- Handle form submission --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.lat || !location.lng) {
      toast.error("Please allow location access before submitting");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to submit SOS");
      navigate("/login");
      return;
    }

    const dataToSubmit = {
      name: formData.name,
      age: formData.age,
      number: formData.number,
      emergency: formData.emergencyType,
      location: {
        latitude: location.lat,
        longitude: location.lng,
      },
    };

    try {
      const response = await fetch("http://localhost:3000/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 send token to backend
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit SOS");
      }

      toast.success("🚨 Emergency submitted successfully!");

      // Redirect after 2s
      setTimeout(() => {
        navigate("/homepage");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit emergency SOS");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-4"
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/homepage")}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          &larr; Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Report {type.charAt(0).toUpperCase() + type.slice(1)} Emergency
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <input
          type="text"
          name="number"
          placeholder="Phone Number"
          value={formData.number}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <input
          type="text"
          name="emergencyType"
          value={formData.emergencyType}
          readOnly
          className="w-full p-2 border rounded-md bg-gray-100"
        />

        <div>
          <label className="text-sm text-gray-500">Live Location</label>
          <p className="text-gray-700">
            {location.lat && location.lng
              ? `Latitude: ${location.lat.toFixed(
                  5
                )}, Longitude: ${location.lng.toFixed(5)}`
              : "Fetching location..."}
          </p>

          <div className="mt-3 w-full h-60 rounded-lg overflow-hidden">
            {isLoaded && location.lat && location.lng ? (
              <GoogleMap
                center={location}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "100%" }}
              >
                <Marker position={location} />
              </GoogleMap>
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">
                Loading map...
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Submit Emergency
        </button>
      </form>
    </div>
  );
}

export default Emergencyform;
