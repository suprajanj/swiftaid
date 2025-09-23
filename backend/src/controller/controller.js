import mongoose from "mongoose";
import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";

// Get all alerts
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get accepted alerts
export const getAllAcceptedAlerts = async (req, res) => {
  try {
    const alerts = await AcceptedAlert.find({ status: "accepted" }).sort({ acceptedAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Accept alert
export const acceptAlert = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id).session(session);
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });

    const exists = await AcceptedAlert.findOne({ originalAlertId: id }).session(session);
    if (exists) return res.status(400).json({ success: false, message: "Already accepted" });

    const accepted = new AcceptedAlert({
      originalAlertId: alert._id,
      ...alert.toObject(),
      status: "accepted",
      acceptedAt: new Date(),
    });

    await accepted.save({ session });
    alert.status = "accepted";
    await alert.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, data: accepted });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel alert
export const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await Alert.findByIdAndUpdate(id, { status: "cancelled" });
    await AcceptedAlert.findOneAndUpdate({ originalAlertId: id }, { status: "cancelled" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark as reached
export const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { status: "reached" },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Complete alert with media
export const completeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaFiles = req.files ? req.files.map(f => f.path) : [];

    const accepted = await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { status: "resolved", completedAt: new Date(), media: mediaFiles },
      { new: true }
    );
    await Alert.findByIdAndUpdate(id, { status: "resolved" });

    res.json({ success: true, data: accepted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get responders (static example, replace with real data)
export const getRespondersForAlert = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [{ lat: 6.9271, lng: 79.8612, emoji: "  🚑" }],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Alerts by status
export const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const alerts = await Alert.find({ status: status.toLowerCase() });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Alert details
export const displayAlertDetails = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Add alert
export const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
