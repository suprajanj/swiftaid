import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboardIcon,
  UsersIcon,
  LogOutIcon,
  Siren,
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit3,
  Save,
  Key,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [user, setUser] = useState(null);
  const [editingUser, setEditingUser] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      id: "requests",
      label: "Requests",
      icon: <Siren size={20} />,
      path: "/requests",
    },
  ];

  // -------------------- Session & Fetch Current User --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // -------------------- Logout --------------------
  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
    setTimeout(() => window.location.reload(), 100);
  }, [navigate]);

  // -------------------- Auto-logout --------------------
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("sessionExpiry");
      if (token && expiry && new Date().getTime() > parseInt(expiry))
        handleLogout();
      else if (token && !expiry)
        localStorage.setItem(
          "sessionExpiry",
          (new Date().getTime() + 24 * 60 * 60 * 1000).toString()
        );
    };
    const interval = setInterval(checkTokenExpiry, 60000);
    checkTokenExpiry();
    return () => clearInterval(interval);
  }, [handleLogout]);

  // -------------------- Save Profile --------------------
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/user/${user._id}`,
        editingUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setShowEditProfile(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  // -------------------- Change Password --------------------
  const handleChangePassword = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("All fields are required");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/user/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
      toast.success("Password changed successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <>
      {/* Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Logout Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile View */}
      {showProfileView && user && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Name:</span> {user.firstName}{" "}
                {user.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Mobile:</span> {user.mobile}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setEditingUser(user);
                  setShowEditProfile(true);
                  setShowProfileView(false);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Edit3 size={16} /> Edit
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setShowProfileView(false);
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Key size={16} /> Change Password
              </button>
              <button
                onClick={() => setShowProfileView(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile */}
      {showEditProfile && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Edit Profile
            </h2>
            <div className="space-y-3">
              {["firstName", "lastName", "email", "mobile"].map((field) => (
                <div key={field}>
                  <label className="block font-medium text-gray-700 mb-1">
                    {field}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={editingUser[field] || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password */}
      {showChangePassword && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Change Password
            </h2>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleChangePassword}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Change
              </button>
              <button
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 relative">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-sm">
                  SA
                </div>
                <h1 className="ml-2 text-xl font-semibold text-gray-800">
                  SwiftAid
                </h1>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-sm mx-auto">
                SA
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors ${
                isCollapsed ? "absolute -right-3 top-6 bg-white shadow-md" : ""
              }`}
            >
              {isCollapsed ? (
                <ChevronRightIcon size={16} className="text-gray-600" />
              ) : (
                <ChevronLeftIcon size={16} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-50"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
              >
                <span className={`${isCollapsed ? "" : "mr-3"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout & User */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOutIcon
              size={20}
              className={`transition-colors ${isCollapsed ? "" : "mr-3"}`}
            />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>

          {!isCollapsed && user && (
            <div
              className="mt-4 pt-4 border-t border-gray-100 cursor-pointer"
              onClick={() => setShowProfileView(true)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                  {user.firstName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.role || "User"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
