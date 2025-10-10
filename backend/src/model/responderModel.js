import mongoose from "mongoose";

const ResponderSchema = new mongoose.Schema({
  NIC: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  position: { type: String, required: true },
  responderType: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "inactive", "busy"],
    default: "inactive",
  },
  lastLocation: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    mapLink: { type: String, default: "" },
  },
});

export default ResponderSchema;
