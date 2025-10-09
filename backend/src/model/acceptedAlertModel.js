import mongoose from "mongoose";

const AcceptedAlertSchema = new mongoose.Schema({
  acceptedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responder",
      required: true,
    },
  ],
  userId: { type: String, required: true, default: "Unknown" },
  NIC: { type: String, required: true, default: "Unknown" },
  contactNumber: { type: String, required: true, default: "Unknown" },
  emergencyType: {
    type: String,
    enum: ["Fire", "Medical", "Robbery", "Accident", "Other"],
    required: true,
    default: "Other",
  },
  address: { type: String, required: true, default: "Not Provided" },
  status: {
    type: String,
    enum: ["accepted", "completed"],
    default: "accepted",
  },
  acceptedAt: { type: Date, default: Date.now },
});

// ✅ Create the model
const AcceptedAlertModel = mongoose.model("AcceptedAlert", AcceptedAlertSchema);

export default AcceptedAlertModel;
