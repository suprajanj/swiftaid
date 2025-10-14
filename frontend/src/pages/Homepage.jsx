import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";
import axios from "axios";

function Homepage() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // -------------------- Check JWT & Fetch User --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // -------------------- Clock --------------------
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

  // -------------------- Initialize AOS + Feather --------------------
  useEffect(() => {
    AOS.init();
    feather.replace();
  }, [time]);

  // -------------------- Navigate to Emergency Form --------------------
  const handleEmergencyClick = (type) => {
    navigate(`/form/${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="bg-white p-4 rounded-2xl shadow-lg mr-6 border border-gray-100">
              <i
                data-feather="alert-triangle"
                className="text-red-500 w-10 h-10"
              ></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                SwiftAid Emergency
              </h1>
              <p className="text-gray-600 text-lg">
                {user
                  ? `Welcome back, ${user.firstName} ${user.lastName}`
                  : "Your safety is our priority"}
              </p>
            </div>
          </div>
          <div className="bg-white text-gray-800 px-8 py-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-2xl font-mono font-semibold tracking-tight">
              {time}
            </div>
            <div className="text-sm text-gray-500 mt-1">{date}</div>
          </div>
        </header>

        {/* Emergency Services Section */}
        <section className="mb-20" data-aos="fade-up">
          <div className="flex items-center mb-8">
            <div className="w-1 h-8 bg-red-500 rounded-full mr-4"></div>
            <h2 className="text-3xl font-semibold text-gray-800">
              Emergency Services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                type: "fire",
                label: "Fire Accident",
                icon: "alert-circle",
                color: "red",
              },
              {
                type: "road",
                label: "Road Accident",
                icon: "alert-octagon",
                color: "orange",
              },
              {
                type: "assault",
                label: "Assault",
                icon: "user-x",
                color: "blue",
              },
              {
                type: "medical",
                label: "Medical Emergency",
                icon: "activity",
                color: "green",
              },
              {
                type: "natural",
                label: "Natural Disaster",
                icon: "wind",
                color: "purple",
              },
            ].map((service) => (
              <button
                key={service.type}
                onClick={() => handleEmergencyClick(service.type)}
                className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center transform hover:-translate-y-1"
              >
                <div
                  className={`bg-${service.color}-50 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <i
                    data-feather={service.icon}
                    className={`w-8 h-8 text-${service.color}-500`}
                  ></i>
                </div>
                <span className="font-medium text-gray-800 text-center group-hover:text-gray-900 transition-colors">
                  {service.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Emergency Information Section */}
        <section data-aos="fade-up">
          <div className="flex items-center mb-8">
            <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
            <h2 className="text-3xl font-semibold text-gray-800">
              Your Emergency Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-50 p-3 rounded-xl mr-4">
                  <i data-feather="user" className="text-blue-500 w-6 h-6"></i>
                </div>
                <h3 className="font-semibold text-xl text-gray-800">
                  Personal Details
                </h3>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium text-gray-800 text-lg">
                    {user ? `${user.firstName} ${user.lastName}` : "John Doe"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800 text-lg">
                    {user?.mobile || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-50 p-3 rounded-xl mr-4">
                  <i data-feather="heart" className="text-red-500 w-6 h-6"></i>
                </div>
                <h3 className="font-semibold text-xl text-gray-800">
                  Health Details
                </h3>
              </div>
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                  <p className="font-medium text-gray-800 text-lg">
                    {user?.blood || "Not Provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Emergency Contact
                  </p>
                  <p className="font-medium text-gray-800 text-lg">
                    {user?.emergencyNumber || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-50 p-3 rounded-xl mr-4">
                  <i
                    data-feather="map-pin"
                    className="text-green-500 w-6 h-6"
                  ></i>
                </div>
                <h3 className="font-semibold text-xl text-gray-800">Address</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Home Address</p>
                  <p className="font-medium text-gray-800 text-lg leading-relaxed">
                    {user?.address || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Homepage;
