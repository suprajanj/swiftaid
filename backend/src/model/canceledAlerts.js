import mongoose from "mongoose";

const canceledAlertSchema = new mongoose.Schema({
  reportId: String,
  acceptedBy: { type: String, required: true },
  userId: String,
  NIC: String,
  contactNumber: String,
  emergencyType: String,
  liveLocation: {
    link: String,
    coordinates: [Number],
  },
  address: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "cancelled" },
  priorityLevel: String,
  reasonToReject: String,
  cancelledAt: { type: Date, default: Date.now },
});

const CanceledAlert = mongoose.models.CanceledAlert || mongoose.model("CanceledAlert", canceledAlertSchema);

export default CanceledAlert;
