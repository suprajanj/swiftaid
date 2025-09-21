import mongoose from "mongoose";

const completedTasksSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, trim: true, index: true },
  userId: { type: String, required: true, trim: true },
  NIC: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true,
    trim: true
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
        message: "Coordinates must be [longitude, latitude]"
      }
    }
  },
  address: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["completed", "cancelled"], // ✅ Simplified for completed tasks
    default: "completed",
    index: true
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    trim: true
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
      "insurance"
    ],
    default: "ambulance",
    trim: true
  },
  description: { type: String, required: true, trim: true },
  photos: { type: [String], default: [] }, // ✅ No longer required
  videos: { type: [String], default: [] }  // ✅ No longer required
}, { versionKey: false });

// ✅ Use the correct completedAlertsDB connection
if (!global.completedAlertsDB) {
  throw new Error("❌ completedAlertsDB is not initialized. Connect to DB before importing model.");
}

const CompletedTask = global.completedAlertsDB.model("CompletedTask", completedTasksSchema);

export default CompletedTask;
