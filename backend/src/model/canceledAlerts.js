import mongoose from "mongoose";

const CanceledAlertSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Alert", required: true },
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Responder" }], // array of ObjectIds
  userId: { type: String },
  NIC: { type: String },
  contactNumber: { type: String },
  emergencyType: { type: String },
  address: { type: String },
  status: { type: String, default: "cancelled" },
  cancelledAt: { type: Date, default: Date.now },
  reasonToReject: { type: String },
});

// ✅ Create the model
const CanceledAlertModel = mongoose.model("CanceledAlert", CanceledAlertSchema);

export default CanceledAlertModel;
