// src/pages/ResourceRequests.jsx
import { useState } from "react";

export default function ResourceRequests() {
  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    district: "",
    city: "",
    fullAddress: "",
    emergencyType: "Medical",
    organizationType: "Hospital",
    urgencyLevel: "Medium",
    resourceType: "Blood",
    bloodGroup: "",
    quantity: 1,
    unit: "",
    requiredBy: "",
    additionalNotes: "",
    description: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting request:", formData);
    // TODO: connect with backend (axios.post)
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resource Requests Management</h1>
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          Admin Mode
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 shadow-md rounded p-6 mt-6"
      >
        <h2 className="text-xl font-semibold text-green-600 mb-4">
          Create New Resource Request
        </h2>

        {/* Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            name="organizationName"
            placeholder="e.g., National Hospital"
            value={formData.organizationName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="contactName"
            placeholder="Full Name"
            value={formData.contactName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="contactPhone"
            placeholder="+94xxxxxxxxx"
            value={formData.contactPhone}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="contactEmail"
            placeholder="contact@gmail.com"
            value={formData.contactEmail}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            name="district"
            placeholder="Colombo"
            value={formData.district}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="Borella"
            value={formData.city}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="fullAddress"
            placeholder="Street, Zone, Landmark"
            value={formData.fullAddress}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
            required
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <select
            name="emergencyType"
            value={formData.emergencyType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option>Medical</option>
            <option>Fire</option>
            <option>Disaster</option>
          </select>
          <select
            name="organizationType"
            value={formData.organizationType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option>Hospital</option>
            <option>NGO</option>
            <option>Other</option>
          </select>
          <select
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            name="resourceType"
            value={formData.resourceType}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option>Blood</option>
            <option>Medicine</option>
            <option>Food</option>
            <option>Other</option>
          </select>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="unit"
            placeholder="e.g., Liters, Packets"
            value={formData.unit}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="requiredBy"
            value={formData.requiredBy}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Row 5 */}
        <div className="mb-4">
          <textarea
            name="description"
            placeholder="Describe the request in detail..."
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <textarea
            name="additionalNotes"
            placeholder="Any additional notes..."
            value={formData.additionalNotes}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
