import mongoose from "mongoose";

const acceptedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true
  },
  liveLocation: {
    link: { type: String, required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "Accepted", "resolved", "cancelled"],
    default: "pending"
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  respoderType: {
    type: String,
    enum: [
      "ambulance",
      "fire_truck",
      "police",
      "rescue_team",
      "Hospital",
      "Media",
      "Insurance"
    ],
    default: "ambulance"
  }
});

// ✅ FIX: Fallback to mongoose connection if global.acceptedAlertsDB is undefined
const dbConnection = global.acceptedAlertsDB || mongoose;
const AcceptedAlert = dbConnection.model("AcceptedAlert", acceptedAlertSchema);

export default AcceptedAlert;
