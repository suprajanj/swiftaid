import mongoose from "mongoose";

const CompletedAlertSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
    NIC: { type: String, required: true },
    contactNumber: { type: String, required: true },
    emergencyType: {
        type: String,
        required: true,
    },
    address: { type: String, required: true },
    status: { type: String, default: "completed" },
    liveLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [0, 0],
        },
        link: { type: String, default: "" },
    },
    acceptedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
    media: [{ type: String }], // Array of file paths or URLs
    comment: { type: String },  
    commentAt: { type: Date, default: Date.now },
    commentBy: { type: String },
    commentByNIC: { type: String },
    commentByContactNumber: { type: String },
});

export default mongoose.model("CompletedAlert", CompletedAlertSchema);