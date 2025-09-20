// LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login"); // Ensure this matches your LoginandSignup.jsx route
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center
                 bg-gradient-to-br from-blue-100 via-blue-50 to-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, #cce7ff, #ffffff 70%)",
      }}
    >
      {/* Headline */}
      <h1 className="text-5xl font-bold text-blue-700 mb-4 text-center">
        Welcome to SwiftAid
      </h1>

      {/* Optional subheadline */}
      <p className="text-lg text-blue-600 mb-8 text-center">
        Your emergency response companion
      </p>

      {/* Get Started Button */}
      <button
        onClick={handleGetStarted}
        className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-lg
                   hover:bg-blue-700 transition duration-300"
      >
        Get Started
      </button>
    </div>
  );
}
