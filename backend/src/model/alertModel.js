import mongoose from "mongoose";

const EmergencyReportSchema = new mongoose.Schema({
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

export default mongoose.model("EmergencyReport", EmergencyReportSchema);
