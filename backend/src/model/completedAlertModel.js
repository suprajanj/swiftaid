import mongoose from "mongoose";

const CompletedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  completedBy: { type: String, default: "" },
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: "completed" },
  completedAt: { type: Date, default: Date.now },
  comment: { type: String },
});

export default CompletedAlertSchema;
