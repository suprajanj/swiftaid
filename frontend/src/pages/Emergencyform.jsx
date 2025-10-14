import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Phone,
  AlertTriangle,
} from "lucide-react";

function Emergencyform() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    number: "",
    emergencyType: type,
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBdD_eg0KYT3Lqovnm9FWJVZnWXrOi6klg",
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit SOS");
      }

      toast.success("🚨 Emergency submitted successfully!");

      setTimeout(() => {
        navigate("/homepage");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit emergency SOS");
    }
  };

  const getEmergencyColor = () => {
    const colors = {
      fire: "red",
      road: "orange",
      assault: "blue",
      medical: "green",
      natural: "purple",
    };
    return colors[type] || "gray";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-lg space-y-6"
      >
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-2">
          <button
            type="button"
            onClick={() => navigate("/homepage")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className={`bg-${getEmergencyColor()}-50 p-3 rounded-xl`}>
            <AlertTriangle
              className={`w-6 h-6 text-${getEmergencyColor()}-500`}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Report {type.charAt(0).toUpperCase() + type.slice(1)} Emergency
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Please verify your information before submitting
            </p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              readOnly
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                readOnly
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="number"
                placeholder="Phone Number"
                value={formData.number}
                onChange={handleChange}
                readOnly
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Emergency Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Type
          </label>
          <input
            type="text"
            name="emergencyType"
            value={formData.emergencyType}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium capitalize"
          />
        </div>

        {/* Location Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Live Location
            </label>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-gray-700 text-sm font-mono">
              {location.lat && location.lng
                ? `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`
                : "Fetching your location..."}
            </p>
          </div>

          <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {isLoaded && location.lat && location.lng ? (
              <GoogleMap
                center={location}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                options={{
                  styles: [
                    {
                      featureType: "all",
                      elementType: "geometry",
                      stylers: [{ color: "#f5f5f5" }],
                    },
                    {
                      featureType: "all",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#666666" }],
                    },
                  ],
                }}
              >
                <Marker
                  position={location}
                  icon={{
                    url: `data:image/svg+xml;base64,${btoa(`
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="15" fill="${getEmergencyColor() === "red" ? "#EF4444" : getEmergencyColor() === "orange" ? "#F97316" : getEmergencyColor() === "blue" ? "#3B82F6" : getEmergencyColor() === "green" ? "#10B981" : "#8B5CF6"}" stroke="white" stroke-width="2"/>
                        <circle cx="16" cy="16" r="6" fill="white"/>
                      </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Submit Emergency Alert
        </button>
      </form>
    </div>
  );
}

export default Emergencyform;
