import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const CreateHospitalResponder = () => {
  const [name, setName] = useState("");
  const [NIC, setNIC] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("Doctor");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(NIC)) {
      toast.error("Invalid NIC format. Must be 9 digits + V/v/X/x or 12 digits.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/responders", {
        NIC,
        name,
        email,
        contactNumber,
        password,
        address,
        position,
        responderType: "medical",
      });

      toast.success(res.data.message || "Hospital responder created successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Error creating hospital responder:", err);
      toast.error(err.response?.data?.error || "Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-green-700 mb-4">🏥 Medical Responder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="NIC" value={NIC} onChange={(e) => setNIC(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Hospital Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border rounded px-3 py-2">
            <option>Doctor</option>
            <option>Nurse</option>
            <option>Surgeon</option>
            <option>Ambulance Driver</option>
          </select>
          <button type="submit" className="w-full py-2 mt-4 bg-green-600 text-white rounded hover:bg-green-700">Create Medical Account</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-green-700 hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default CreateHospitalResponder;
