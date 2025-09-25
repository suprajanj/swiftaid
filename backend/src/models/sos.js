// models/SOS.js
import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: String, required: true },
    number: { type: String, required: true },
    emergencyType: { type: String, required: true },
    assignedResponder: { type: mongoose.Schema.Types.ObjectId, ref: "Responder" },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"],
      default: "Pending", // New SOS will start as Pending
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      mapLink: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);
