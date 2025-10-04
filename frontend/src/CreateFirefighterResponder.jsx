import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateFirefighterResponder = () => {
  const [name, setName] = useState("");
  const [NIC, setNIC] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("Firefighter");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NIC validation for old and new formats
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(NIC)) {
      toast.error("Invalid NIC format. Must be 9 digits + V/v/X/x or 12 digits.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/create-responder", {
        NIC,
        name,
        email,
        contactNumber,
        password,
        address,
        position,
        responderType: "firefighter", // ✅ must match backend
      });

      toast.success(res.data.message || "✅ Firefighter responder created successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Error creating firefighter responder:", err);
      toast.error(err.response?.data?.error || "❌ Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-700 to-red-500 p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-red-700 mb-4">
          🔥 Firefighter Responder
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="NIC" value={NIC} onChange={(e) => setNIC(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Fire Station / Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border rounded px-3 py-2">
            <option>Firefighter</option>
            <option>Rescue Operator</option>
            <option>Chief Fire Officer</option>
            <option>Paramedic</option>
          </select>
          <button type="submit" className="w-full py-2 mt-4 bg-red-600 text-white rounded hover:bg-red-700">
            Create Firefighter Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFirefighterResponder;
