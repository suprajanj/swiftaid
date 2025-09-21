// backend/model/alertModel.js
import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
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
    default: "pending",
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
});

const dbConnection = global.allAlertsDB || mongoose;
const Alert = dbConnection.model("Alert", alertSchema);

export default Alert;