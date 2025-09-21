// models/AcceptedAlert.js
import mongoose from "mongoose";

const AcceptedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: { 
    type: String, 
    required: true,
    enum: ["medical", "fire", "police", "hospital", "media", "insurance"], // all lowercase
  },
  address: { type: String, required: true },
  status: { type: String, default: "accepted" },
  liveLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
    link: { type: String, default: "" },
  },
  acceptedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

AcceptedAlertSchema.index({ liveLocation: "2dsphere" });

export default mongoose.model("AcceptedAlert", AcceptedAlertSchema);
