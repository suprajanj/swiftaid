// backend/model/completedTaskModel.js
import mongoose from "mongoose";

const completedTaskSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true,
  },
  liveLocation: {
    link: { type: String, required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  address: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "accepted", "resolved", "cancelled"],
    default: "resolved",
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  responderType: {
    type: String,
    enum: [
      "ambulance",
      "fire_truck",
      "police",
      "rescue_team",
      "Hospital",
      "Media",
      "Insurance",
    ],
    default: "ambulance",
  },
  photos: { type: [String], default: [] },
  videos: { type: [String], default: [] },
});

const dbConnection = global.completedTasksDB || mongoose;
const CompletedTask = dbConnection.model("CompletedTask", completedTaskSchema);

export default CompletedTask;