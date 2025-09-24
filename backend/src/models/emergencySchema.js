import mongoose from "mongoose";

const EmergencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  number: { type: String, required: true },
  emergencyType: { type: String, required: true },
  assignedResponder: { type: String, default: "Unassigned" },
  location: {
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    mapLink: { type: String },
  },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Emergency", EmergencySchema);