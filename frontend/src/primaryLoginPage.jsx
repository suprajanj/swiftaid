import React from "react";
import { useNavigate } from "react-router-dom";

const PrimaryLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
          🚨 SwiftAid Responder Portal
        </h1>
        <p className="text-gray-600 mb-8">
          Select your role to create an emergency responder account.
        </p>

        <div className="flex flex-col gap-4">
          <button
            className="py-3 px-6 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md hover:bg-blue-700 hover:scale-105 transition duration-200"
            onClick={() => navigate("/create-police-responder")}
          >
            👮 Create Police Responder
          </button>

          <button
            className="py-3 px-6 rounded-lg bg-green-600 text-white font-bold text-lg shadow-md hover:bg-green-700 hover:scale-105 transition duration-200"
            onClick={() => navigate("/create-hospital-responder")}
          >
            🏥 Create Hospital Responder
          </button>

          <button
            className="py-3 px-6 rounded-lg bg-red-600 text-white font-bold text-lg shadow-md hover:bg-red-700 hover:scale-105 transition duration-200"
            onClick={() => navigate("/create-firefighter-responder")}
          >
            🚒 Create Firefighter Responder
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrimaryLoginPage;
