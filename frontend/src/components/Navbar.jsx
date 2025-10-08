// Navbar.jsx
import React from "react";
import { User, Shield, Heart, MapPin, Phone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="border-b border-gray-100 px-8 py-5 flex items-center justify-between backdrop-blur-sm bg-white/95">
      {/* Left: Brand with Icon */}
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl shadow-sm">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          SwiftAid
        </span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="flex items-center space-x-8">
        <Link
          to="#"
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 font-medium transition-all duration-300 group"
        >
          <MapPin className="w-4 h-4" />
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
            Locations
          </span>
        </Link>

        <Link
          to="#"
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 font-medium transition-all duration-300 group"
        >
          <Heart className="w-4 h-4" />
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
            Services
          </span>
        </Link>

        <Link
          to="#"
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 font-medium transition-all duration-300 group"
        >
          <Phone className="w-4 h-4" />
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
            Contact
          </span>
        </Link>

        <Link
          to="#"
          className="text-gray-600 hover:text-red-500 font-medium transition-all duration-300 group"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
            About
          </span>
        </Link>
      </div>

      {/* Right: Enhanced Profile Section */}
      <Link
        to="/profile"
        className="group flex items-center space-x-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 px-5 py-3 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl border border-gray-200 group-hover:border-gray-300 transition-colors shadow-sm">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-800">
            My Profile
          </span>
          <span className="text-xs text-gray-500 group-hover:text-gray-600">
            Manage account
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </Link>
    </nav>
  );
}

export default Navbar;
