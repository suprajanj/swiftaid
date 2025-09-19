import mongoose from "mongoose";

// Create schema
const sosSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: String, required: true },
    number: { type: String, required: true },
    emergency: { type: String, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      mapLink: { type: String }, // store Google Maps link
    },
  },
  { timestamps: true }
);

const SOS = mongoose.model("SOS", sosSchema);

export default SOS;
