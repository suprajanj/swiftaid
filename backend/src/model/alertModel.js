import mongoose from "mongoose";

// ✅ Use the default mongoose connection (main alerts DB)
const EmergencyReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  NIC: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "accident", "assault", "natural_disaster", "other"],
    required: true,
    trim: true
  },
  liveLocation: {
    link: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: "Coordinates must contain [longitude, latitude]"
      }
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "resolved", "cancelled"], // ✅ all lowercase
    default: "pending",
    index: true
  },
  priorityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    trim: true
  }
}, { versionKey: false });

const EmergencyReport = mongoose.model("EmergencyReport", EmergencyReportSchema);
export default EmergencyReport;
