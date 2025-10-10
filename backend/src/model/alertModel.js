import mongoose from "mongoose";

const EmergencyReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true,
  },
  assignedResponders: [
    {
      _id: { type: String },
      NIC: { type: String },
      name: { type: String },
      contactNumber: { type: String },
      email: { type: String },
      responderType: { type: String },
      position: { type: String },
    },
  ],
  liveLocation: {
    link: { type: String, required: true },
    coordinates: { type: [Number], required: true },
  },
  address: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-progress", "resolved", "cancelled"],
    default: "pending",
  },
});

export default EmergencyReportSchema;