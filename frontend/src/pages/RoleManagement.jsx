import React, { useState, useEffect } from "react";
import { ChevronDownIcon, Trash2Icon, X, Edit3, Save } from "lucide-react";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";

export function RoleManagement() {
  const [activeTab, setActiveTab] = useState("roles");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    address: "",
    gender: "",
    dob: "",
    termsAccepted: false,
  });

  const roles = [
    "Admin",
    "Dispatcher",
    "User",
    "Fund Raiser",
    "Supportive organization",
    "Responder",
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:3000/api/user/${userId}`, {
        role: newRole,
      });
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  // ✅ Delete user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/user/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ✅ Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "firstName",
      "lastName",
      "nic",
      "email",
      "password",
      "confirmPassword",
      "mobile",
      "address",
      "gender",
      "dob",
      "termsAccepted",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        newUser[field] === "" ||
        newUser[field] === null ||
        newUser[field] === undefined ||
        (field === "termsAccepted" && newUser[field] !== true)
    );

    if (missingFields.length > 0) {
      alert(
        "Please fill all required fields before saving:\n" +
          missingFields.join(", ")
      );
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const payload = {
        ...newUser,
        dob: new Date(newUser.dob),
        termsAccepted: Boolean(newUser.termsAccepted),
      };
      const res = await axios.post("http://localhost:3000/api/user", payload);
      setUsers([...users, res.data]);
      setShowModal(false);
      setNewUser({
        firstName: "",
        lastName: "",
        nic: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        address: "",
        gender: "",
        dob: "",
        termsAccepted: false,
        role: "User",
      });
    } catch (err) {
      console.error(
        "Failed to add user:",
        err.response?.data || err.message || err
      );
      alert(
        "Failed to add user: " +
          JSON.stringify(err.response?.data || err.message || err)
      );
    }
  };

  // ✅ Save edited user
  const handleSaveEdit = async () => {
    try {
      const payload = { ...viewUser };
      await axios.put(
        `http://localhost:3000/api/user/${viewUser._id}`,
        payload
      );
      setUsers(users.map((u) => (u._id === viewUser._id ? viewUser : u)));
      setEditing(false);
      setViewUser(null);
    } catch (err) {
      console.error("Failed to save user:", err);
      alert(
        "Failed to save user: " + (err.response?.data || err.message || err)
      );
    }
  };

  // ✅ Filtered users based on search
  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.role}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Users</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search users..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-gray-600">Loading users...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td
                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => {
                          setViewUser({ ...user });
                          setEditing(false);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {user.firstName?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "Dispatcher"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "Fund Raiser"
                                  ? "bg-green-100 text-green-800"
                                  : user.role === "Supportive organization"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === user._id ? null : user._id
                              )
                            }
                            className="flex items-center justify-between w-24 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                          >
                            <span>Change</span>
                            <ChevronDownIcon size={16} />
                          </button>
                          {dropdownOpen === user._id && (
                            <div className="absolute z-10 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200">
                              {roles.map((role) => (
                                <button
                                  key={role}
                                  onClick={() => {
                                    handleRoleChange(user._id, role);
                                    setDropdownOpen(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center gap-1 px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                        >
                          <Trash2Icon size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* All input fields */}
              <input
                type="text"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="NIC"
                value={newUser.nic}
                onChange={(e) =>
                  setNewUser({ ...newUser, nic: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={newUser.confirmPassword}
                onChange={(e) =>
                  setNewUser({ ...newUser, confirmPassword: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="Mobile"
                value={newUser.mobile}
                onChange={(e) =>
                  setNewUser({ ...newUser, mobile: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={newUser.address}
                onChange={(e) =>
                  setNewUser({ ...newUser, address: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />
              <select
                value={newUser.gender}
                onChange={(e) =>
                  setNewUser({ ...newUser, gender: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="date"
                value={newUser.dob}
                onChange={(e) =>
                  setNewUser({ ...newUser, dob: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md text-sm"
                required
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newUser.termsAccepted}
                  onChange={(e) =>
                    setNewUser({ ...newUser, termsAccepted: e.target.checked })
                  }
                  required
                />
                <label className="text-sm text-gray-700">
                  I accept the terms and conditions
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Save User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {viewUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">User Details</h2>
              <button onClick={() => setViewUser(null)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                "firstName",
                "lastName",
                "nic",
                "email",
                "mobile",
                "address",
              ].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium">
                    {field.replace(/^\w/, (c) => c.toUpperCase())}
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={viewUser[field]}
                      onChange={(e) =>
                        setViewUser({ ...viewUser, [field]: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded-md text-sm"
                    />
                  ) : (
                    <div className="text-gray-700">{viewUser[field]}</div>
                  )}
                </div>
              ))}
              <div>
                <label className="text-sm font-medium">Gender</label>
                {editing ? (
                  <select
                    value={viewUser.gender}
                    onChange={(e) =>
                      setViewUser({ ...viewUser, gender: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="text-gray-700">{viewUser.gender}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    value={viewUser.dob?.split("T")[0]}
                    onChange={(e) =>
                      setViewUser({ ...viewUser, dob: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md text-sm"
                  />
                ) : (
                  <div className="text-gray-700">
                    {viewUser.dob?.split("T")[0]}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                {editing ? (
                  <select
                    value={viewUser.role}
                    onChange={(e) =>
                      setViewUser({ ...viewUser, role: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-700">{viewUser.role}</div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {editing ? (
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <Save size={16} /> Save
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <Edit3 size={16} /> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
