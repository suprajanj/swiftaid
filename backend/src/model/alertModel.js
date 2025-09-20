// models/EmergencyReport.js
import mongoose from "mongoose";

const EmergencyReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  NIC: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true
  },
  liveLocation: {
    link: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "Accepted", "resolved", "cancelled"],
    default: "pending"
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  }
});

const EmergencyReport = mongoose.model("EmergencyReport", EmergencyReportSchema);
export default EmergencyReport;
