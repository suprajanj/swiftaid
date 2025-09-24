import React from "react";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BarChart3Icon,
  LogOutIcon,
  Siren,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboardIcon size={20} />,
      path: "/dashboard",
    },
    {
      id: "roles",
      label: "Role Management",
      icon: <UsersIcon size={20} />,
      path: "/roles",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3Icon size={20} />,
      path: "/analytics",
    },
    {
      id: "Requests",
      label: "Requests",
      icon: <Siren size={20} />,
      path: "/requests",
    },
  ];

  // ✅ Simple Logout with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // if stored
      navigate("/");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-red-600 flex items-center justify-center text-white font-bold">
            SA
          </div>
          <h1 className="ml-2 text-xl font-semibold text-gray-800">SwiftAid</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center w-full px-4 py-3 mb-1 rounded-md transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
        >
          <LogOutIcon size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
