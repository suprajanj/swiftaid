import mongoose from "mongoose";

const ResponderSchema = new mongoose.Schema({
  NIC: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  emergencyType: {
    type: String,
    required: true,
  },
  status: { type: String, default: "available" },
  lastlocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },
  assignedAlerts: [{ type: String, ref: "Alert" }],
  rejectedAlerts: [{ type: String, ref: "Alert" }], // Array of alert IDs that the responder has rejected
  acceptedAlerts: [{ type: String, ref: "AcceptedAlert" }], // Array of alert IDs that the responder has accepted
  completedAlerts: [{ type: String, ref: "CompletedAlert" }], // Array of alert IDs that the responder has completed
  cancelledAlerts: [{ type: String, ref: "CanceledAlert" }], // Array of alert IDs that the responder has cancelled
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Responder", ResponderSchema);