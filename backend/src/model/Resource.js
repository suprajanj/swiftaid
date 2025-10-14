import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
}, { timestamps: true });

export default mongoose.model("Resource", resourceSchema);
