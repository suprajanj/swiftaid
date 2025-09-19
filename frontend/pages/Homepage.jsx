import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";

function Homepage() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  // Update clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      setTime(now.toLocaleTimeString("en-US", timeOptions));
      setDate(now.toLocaleDateString("en-US", dateOptions));
    }

    const timer = setInterval(updateClock, 1000);
    updateClock();

    return () => clearInterval(timer);
  }, []);

  // Initialize AOS + Feather Icons
  useEffect(() => {
    AOS.init();
    feather.replace();
  }, [time]);

  // Navigate to form with emergency type
  const handleEmergencyClick = (type) => {
    navigate(`/form/${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <i
                data-feather="alert-triangle"
                className="text-red-600 w-8 h-8"
              ></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                SwiftAid Emergency Dashboard
              </h1>
              <p className="text-gray-600">Your safety is our priority</p>
            </div>
          </div>
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md">
            <div className="text-xl font-mono font-bold">{time}</div>
            <div className="text-sm opacity-80">{date}</div>
          </div>
        </header>

        {/* Temporary Navigation Button */}
        {/* <div className="mb-8">
          <button
            onClick={() => navigate("/form")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
          >
            Go to Form (Temporary Button)
          </button>
        </div> */}

        {/* Emergency Services Section */}
        <section className="mb-16" data-aos="fade-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Emergency Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Fire Accident */}
            <button
              onClick={() => handleEmergencyClick("fire")}
              className="emergency-btn bg-red-500 hover:bg-red-600 text-white p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300"
            >
              <i data-feather="alert-circle" className="w-10 h-10 mb-3"></i>
              <span className="font-semibold text-lg">Fire Accident</span>
            </button>

            {/* Road Accident */}
            <button
              onClick={() => handleEmergencyClick("road")}
              className="emergency-btn bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300"
            >
              <i data-feather="alert-octagon" className="w-10 h-10 mb-3"></i>
              <span className="font-semibold text-lg">Road Accident</span>
            </button>

            {/* Assault */}
            <button
              onClick={() => handleEmergencyClick("assault")}
              className="emergency-btn bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300"
            >
              <i data-feather="user-x" className="w-10 h-10 mb-3"></i>
              <span className="font-semibold text-lg">Assault</span>
            </button>

            {/* Medical Emergency */}
            <button
              onClick={() => handleEmergencyClick("medical")}
              className="emergency-btn bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300"
            >
              <i data-feather="activity" className="w-10 h-10 mb-3"></i>
              <span className="font-semibold text-lg">Medical Emergency</span>
            </button>

            {/* Natural Disaster */}
            <button
              onClick={() => handleEmergencyClick("natural")}
              className="emergency-btn bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300"
            >
              <i data-feather="wind" className="w-10 h-10 mb-3"></i>
              <span className="font-semibold text-lg">Natural Disaster</span>
            </button>
          </div>
        </section>

        {/* Emergency Information Section */}
        <section data-aos="fade-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Emergency Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <i data-feather="user" className="text-blue-500 w-5 h-5"></i>
                </div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Personal Details
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">John Doe</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">O+</p>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition duration-300">
                  Update Personal Details
                </button>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <i
                    data-feather="phone"
                    className="text-green-500 w-5 h-5"
                  ></i>
                </div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Contact Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-medium">
                    Jane Doe (Spouse) +1 (555) 987-6543
                  </p>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition duration-300">
                  Update Contact Information
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <i
                    data-feather="map-pin"
                    className="text-red-500 w-5 h-5"
                  ></i>
                </div>
                <h3 className="font-semibold text-lg text-gray-800">
                  Location
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="font-medium">123 Main St, Anytown, USA</p>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition duration-300">
                  Update Location
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Homepage;
