import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference User
      ref: "User",
      required: false,
    },

    name: { type: String, required: true },
    age: { type: String, required: true },
    number: { type: String, required: true },
    emergency: { type: String, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      mapLink: { type: String },
    },

    assignedResponder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Responder",
    },

    // ✅ New fields
    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Accepted",
        "Completed",
        "Cancel",
        "Reached",
      ],
      default: "Pending",
    },
    acceptedAt: { type: Date }, // Will be set when accepted
    completedAt: { type: Date }, // Will be set when completed
    comment: { type: String }, // Optional
  },
  { timestamps: true }
);

const SOS = mongoose.model("SOS", sosSchema);

export default SOS;
