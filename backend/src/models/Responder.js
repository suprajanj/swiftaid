import mongoose from "mongoose";

const responderSchema = new mongoose.Schema({
  NIC: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  responderType: { type: String, required: true }, // police, hospital, firefighter
  status: { type: String, default: "available" },
  lastLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      mapLink: { type: String },
    },
  position: { type: String, required: true },
},
{ timestamps: true }
);

const Responder = mongoose.model("Responder", responderSchema);

export default Responder;
