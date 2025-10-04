import mongoose from "mongoose";

const AcceptedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  acceptedBy: { type: String, default: "" },
  userId: { type: String, required: true },
  NIC: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emergencyType: {
    type: String,
    enum: ["medical", "fire", "assault", "hospital", "accident", "other"],
    required: true,
  },
  address: { type: String, required: true },
  status: { type: String, default: "accepted" },
  acceptedAt: { type: Date, default: Date.now },
});

export default mongoose.model("AcceptedAlert", AcceptedAlertSchema);
