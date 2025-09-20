// Navbar.jsx
import React from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left: Brand or Logo */}
      <div className="text-2xl font-bold text-red-600">SwiftAid</div>

      {/* Center: Navigation Links */}
      <div className="flex space-x-6">
        <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
          Link 01
        </Link>
        <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
          Link 02
        </Link>
        <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
          Link 03
        </Link>
        <Link to="#" className="text-gray-700 hover:text-red-600 font-medium">
          Link 04
        </Link>
      </div>

      {/* Right: Profile + Temp Login Button */}
      <div className="flex items-center space-x-4">
        {/* Profile link */}
        <Link
          to="/profile"
          className="flex items-center text-gray-700 hover:text-red-600"
        >
          <User className="w-6 h-6 mr-2" />
          <span className="hidden sm:inline font-medium">View Profile</span>
        </Link>

        {/* ✅ Temp Login Button */}
        <Link
          to="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
        >
          Login & Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
