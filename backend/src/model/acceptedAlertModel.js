import mongoose from "mongoose";

const acceptedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, trim: true, index: true },
  userId: { type: String, required: true, trim: true },
  NIC: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true,
    trim: true,
  },
  liveLocation: {
    link: { type: String, required: true, trim: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  address: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "accepted", "resolved", "cancelled"], // ✅ lowercase
    default: "accepted",
    index: true,
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    trim: true,
  },
  responderType: {
    type: String,
    enum: [
      "ambulance",
      "fire_truck",
      "police",
      "rescue_team",
      "hospital",
      "media",
      "insurance",
    ],
    default: "ambulance",
    trim: true,
  },
  photos: { type: [String], default: [] },
  videos: { type: [String], default: [] },
}, { versionKey: false });

// ✅ Use only the acceptedAlertsDB connection
if (!global.acceptedAlertsDB) {
  throw new Error("❌ acceptedAlertsDB is not initialized. Connect to DB before importing model.");
}

const AcceptedAlert = global.acceptedAlertsDB.model("AcceptedAlert", acceptedAlertSchema);

export default AcceptedAlert;
