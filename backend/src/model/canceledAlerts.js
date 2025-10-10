import mongoose from "mongoose";

const CanceledAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  acceptedBy: { type: String, default: "" },
  userId: { type: String },
  NIC: { type: String },
  contactNumber: { type: String },
  emergencyType: { type: String },
  address: { type: String },
  status: { type: String, default: "cancelled" },
  cancelledAt: { type: Date, default: Date.now },
  reasonToReject: { type: String },
});

export default CanceledAlertSchema;
