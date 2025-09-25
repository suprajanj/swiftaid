import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000"; // backend URL

const AdminPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    organizationType: "",
    accessLevel: "",
    isActive: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // create / edit / access
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationType: "NGO",
    contactPerson: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    registrationNumber: "",
    accessLevel: "Basic",
    allowedRegions: [],
    allowedIncidentTypes: [],
    isActive: true,
  });

  // Fetch organizations
  useEffect(() => {
    fetchOrganizations();
  }, [pagination.currentPage, filters]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, val]) => val !== "")
        ),
      });

      const res = await fetch(`${API_BASE}/api/orgs?${query}`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();

      setOrganizations(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error(err);
      toast.error("Error fetching organizations");
    } finally {
      setLoading(false);
    }
  };

  // Handle filters
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      organizationType: "",
      accessLevel: "",
      isActive: "",
    });
  };

  // Modal
  const openModal = (type, org = null) => {
    setModalType(type);
    setSelectedOrg(org);

    if (type === "create") {
      setFormData({
        name: "",
        email: "",
        organizationType: "NGO",
        contactPerson: "",
        phone: "",
        address: { street: "", city: "", state: "", zipCode: "", country: "" },
        registrationNumber: "",
        accessLevel: "Basic",
        allowedRegions: [],
        allowedIncidentTypes: [],
        isActive: true,
      });
    } else {
      setFormData({ ...org });
    }
    setShowModal(true);
  };

  // Create / Update / Access
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      let payload = { ...formData };

      // For creation, add required 'createdBy' field
      if (modalType === "create") {
        // TODO: Replace with actual admin/user ID from your app
        payload.createdBy = "64f1234567890abcdef12345";
      }

      // Send request based on modal type
      if (modalType === "create") {
        response = await fetch("http://localhost:3000/api/orgs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (modalType === "edit") {
        response = await fetch(
          `http://localhost:3000/api/orgs/${selectedOrg._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else if (modalType === "access") {
        response = await fetch(
          `http://localhost:3000/api/orgs/${selectedOrg._id}/access`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      // Check response
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `Organization ${
            modalType === "create"
              ? "created"
              : modalType === "edit"
                ? "updated"
                : "access updated"
          } successfully`
        );
        setShowModal(false);
        fetchOrganizations();
      } else {
        console.error("Backend error:", data);
        toast.error(data.message || "Failed operation");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Delete
const handleDelete = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/orgs/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    // Only parse JSON if response has content
    let data = {};
    try {
      data = await response.json();
    } catch (err) {
      console.warn("No JSON in response");
    }

    if (!response.ok) {
      toast.error(data.message || "Failed to delete organization");
      return;
    }

    toast.success(data.message || "Deleted successfully");
    fetchOrganizations(); // refresh list
  } catch (err) {
    toast.error("Something went wrong");
    console.error(err);
  }
};


  const typeColor = (type) =>
    ({
      NGO: "bg-green-100 text-green-800",
      Insurance: "bg-blue-100 text-blue-800",
      Media: "bg-purple-100 text-purple-800",
    })[type] || "bg-gray-100 text-gray-800";

  const levelColor = (level) =>
    ({
      Basic: "bg-gray-100 text-gray-800",
      Standard: "bg-yellow-100 text-yellow-800",
      Premium: "bg-green-100 text-green-800",
    })[level] || "bg-gray-100 text-gray-800";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Organization Management
          </h1>
          <p className="text-gray-600">
            Manage organization access and permissions
          </p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Organization
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide" : "Show"}
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            />
            <select
              value={filters.organizationType}
              onChange={(e) =>
                handleFilterChange("organizationType", e.target.value)
              }
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="">All Types</option>
              <option value="NGO">NGO</option>
              <option value="Insurance">Insurance</option>
              <option value="Media">Media</option>
            </select>
            <select
              value={filters.accessLevel}
              onChange={(e) =>
                handleFilterChange("accessLevel", e.target.value)
              }
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="">All Levels</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={clearFilters}
              className="col-span-4 bg-gray-200 px-3 py-2 rounded-md mt-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Access
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((org) => (
              <tr key={org._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {org.name}
                  </div>
                  <div className="text-sm text-gray-500">{org.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(org.organizationType)}`}
                  >
                    {org.organizationType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor(org.accessLevel)}`}
                  >
                    {org.accessLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {org.isActive ? (
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-700">
                      <XCircle className="h-4 w-4" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openModal("edit", org)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openModal("access", org)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft /> Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto py-10">
          <div className="bg-white rounded-md shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalType === "create"
                  ? "Create Organization"
                  : modalType === "edit"
                    ? "Edit Organization"
                    : "Manage Access"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {modalType !== "access" && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactPerson: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Registration Number"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registrationNumber: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                      required
                    />
                    <select
                      value={formData.organizationType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organizationType: e.target.value,
                        }))
                      }
                      className="border px-3 py-2 rounded-md"
                    >
                      <option value="NGO">NGO</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Media">Media</option>
                    </select>
                  </div>
                </>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={formData.accessLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accessLevel: e.target.value,
                    }))
                  }
                  className="border px-3 py-2 rounded-md"
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
                <select
                  value={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "true",
                    }))
                  }
                  className="border px-3 py-2 rounded-md"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {modalType === "create"
                    ? "Create"
                    : modalType === "edit"
                      ? "Update"
                      : "Update Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
