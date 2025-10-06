import mongoose from "mongoose";

const ResponderSchema = new mongoose.Schema({
  NIC: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  responderType: { type: String, required: true }, // police, hospital, firefighter
  status: { type: String, default: "available" },
  lastLocation: {
    link: { type: String },
    coordinates: { type: [Number] },
  },
  position: { type: String, required: true },
});

const Responder = mongoose.model("Responder", ResponderSchema);

export default Responder;
