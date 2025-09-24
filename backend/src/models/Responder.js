import mongoose from "mongoose";

const responderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String },
  availability: { type: Boolean, default: true },
  emergencyType: { type: String, enum: ["Medical", "Fire", "Police"], required: true },
  lastLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { timestamps: true });

const Responder = mongoose.model("Responder", responderSchema);
export default Responder;