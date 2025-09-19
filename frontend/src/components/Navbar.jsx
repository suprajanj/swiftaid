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

      {/* Right: Profile Icon */}
      <div>
        {/* Whole profile area is a link to /profile */}
        <Link
          to="/profile"
          className="flex items-center text-gray-700 hover:text-red-600"
        >
          <User className="w-6 h-6 mr-2" />
          <span className="hidden sm:inline font-medium">View Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
