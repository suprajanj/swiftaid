import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateResponder = () => {
  const [name, setName] = useState("");
  const [nic, setNIC] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState({ lat: 0, lng: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("/api/create-responder", {
        name,
        nic,
        address,
        position,
      })
      .then(() => {
        toast.success("Responder account created successfully!");
        setName("");
        setNIC("");
        setAddress("");
        setPosition({ lat: 0, lng: 0 });
      })
      .catch(() => {
        toast.error("Error creating responder account");
      });
  };

  return (
    <div className="container">
      <h1>Create Responder Account</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>NIC</label>
          <input
            type="text"
            className="form-control"
            value={nic}
            onChange={(e) => setNIC(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Position (lat, lng)</label>
          <input
            type="text"
            className="form-control"
            value={`${position.lat}, ${position.lng}`}
            onChange={(e) => {
              const [lat, lng] = e.target.value.split(",").map(Number);
              setPosition({ lat: lat || 0, lng: lng || 0 });
            }}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Responder Account
        </button>
      </form>
    </div>
  );
};

export default CreateResponder;
