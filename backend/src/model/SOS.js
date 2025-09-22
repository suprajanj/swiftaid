import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference User
      ref: "User",
      required: true,
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
  },
  { timestamps: true }
);

const SOS = mongoose.model("SOS", sosSchema);

export default SOS;
