// models/CompletedAlert.js
import mongoose from "mongoose";

const CompletedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  completedBy: { type: String, required: true },
  position: { type: String, default: "" },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },

  emergencyType: { type: String, required: true },
  location: { type: String, required: true },

  senderNIC: { type: String },
  senderName: { type: String },
  senderContactNumber: { type: String },
  senderAddress: { type: String },

  otherParticipants: { type: String },
  casualties: { type: Number },
  criticalInjuries: { type: Number },
  fatalities: { type: Number },
  totalVictims: { type: Number },
  otherResponders: { type: [String] },

  files: [{ type: String }], // store file paths
  comment: { type: String },

  completedAt: { type: Date, default: Date.now },
});

// ✅ Create the model
const CompletedAlertModel = mongoose.model("CompletedAlert", CompletedAlertSchema);

export default CompletedAlertModel;
