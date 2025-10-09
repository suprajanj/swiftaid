// src/models/responderModel.js
import mongoose from "mongoose";

const responderSchema = new mongoose.Schema({
  NIC: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  position: { type: String, required: true },
  responderType: { type: String, enum: ["medical", "fire", "police"], required: true },
  lastLocation: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    mapLink: { type: String, default: "" },
  },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },
});

// ✅ Create the model
const ResponderModel = mongoose.model("Responder", responderSchema);

export default ResponderModel;
