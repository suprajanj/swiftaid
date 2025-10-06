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
  User,
  Mail,
  Phone,
  Shield,
  Eye,
  EyeOff,
  X,
  CheckCircle,
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

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

  // Common Modal Wrapper Component
  const ModalWrapper = ({ children, onClose, title, icon: Icon }) => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon size={20} className="text-blue-600" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <ModalWrapper
          onClose={() => setShowLogoutConfirm(false)}
          title="Confirm Logout"
          icon={LogOutIcon}
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOutIcon size={24} className="text-red-600" />
              </div>
              <p className="text-gray-600 text-lg">
                Are you sure you want to logout?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Profile View */}
      {showProfileView && user && (
        <ModalWrapper
          onClose={() => setShowProfileView(false)}
          title="My Profile"
          icon={User}
        >
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {user.firstName?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-blue-600 font-medium">
                  {user.role || "User"}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-800">{user.mobile}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setEditingUser(user);
                  setShowEditProfile(true);
                  setShowProfileView(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-sm"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setShowProfileView(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-sm"
              >
                <Key size={18} />
                Password
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Profile */}
      {showEditProfile && (
        <ModalWrapper
          onClose={() => setShowEditProfile(false)}
          title="Edit Profile"
          icon={Edit3}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editingUser.firstName || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.lastName || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={editingUser.email || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    email: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Email Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                value={editingUser.mobile || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    mobile: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Mobile Number"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-sm"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Change Password */}
      {/* Change Password */}
      {showChangePassword && (
        <ModalWrapper
          onClose={() => setShowChangePassword(false)}
          title="Change Password"
          icon={Shield}
        >
          <div className="space-y-6">
            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield
                  size={18}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Security Requirements
                  </p>
                  <p className="text-xs text-blue-600">
                    Password must be at least 8 characters with uppercase,
                    number, and special character
                  </p>
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Create a strong new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          passwordData.newPassword.length >= 8
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          passwordData.newPassword.length >= 8
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /[A-Z]/.test(passwordData.newPassword)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          /[A-Z]/.test(passwordData.newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /[0-9]/.test(passwordData.newPassword)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          /[0-9]/.test(passwordData.newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          /[!@#$%^&*]/.test(passwordData.newPassword)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          /[!@#$%^&*]/.test(passwordData.newPassword)
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        One special character
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 transition-all duration-200 bg-white ${
                      passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {passwordData.confirmPassword &&
                  passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <X size={14} />
                      Passwords do not match
                    </p>
                  )}
                {passwordData.confirmPassword &&
                  passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Passwords match
                    </p>
                  )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  passwordData.newPassword !== passwordData.confirmPassword ||
                  !passwordRegex.test(passwordData.newPassword)
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-sm transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Sidebar (unchanged) */}
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
