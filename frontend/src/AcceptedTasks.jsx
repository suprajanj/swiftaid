import mongoose from "mongoose";
import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";
import CompletedAlert from "../model/completedAlertModel.js";

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllAcceptedAlerts = async (req, res) => {
  try {
    const alerts = await AcceptedAlert.find({ status: "accepted" }).sort({
      acceptedAt: -1,
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const alerts = await Alert.find({ status: status.toLowerCase() });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const displayAlertDetails = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const acceptAlert = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id).session(session);
    if (!alert)
      return res.status(404).json({ success: false, message: "Alert not found" });

    const exists = await AcceptedAlert.findOne({
      originalAlertId: id,
    }).session(session);
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Already accepted" });

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
const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await Alert.findByIdAndUpdate(id, { status: "cancelled" });
    await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { status: "cancelled" }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark as reached
const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;

    const accepted = await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { status: "reached" },
      { new: true }
    );
    await Alert.findByIdAndUpdate(id, { status: "reached" });

    res.json({ success: true, data: accepted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const completeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaFiles = req.files ? req.files.map((f) => f.path) : [];

    // Update AcceptedAlert
    const accepted = await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { status: "resolved", completedAt: new Date(), media: mediaFiles },
      { new: true }
    );

    if (!accepted) {
      return res
        .status(404)
        .json({ success: false, message: "Accepted alert not found" });
    }

    // Update Alert
    await Alert.findByIdAndUpdate(id, { status: "resolved" });

    // Save CompletedAlert
    const completed = new CompletedAlert({
      reportId: accepted.reportId,
      userId: accepted.userId,
      NIC: accepted.NIC,
      contactNumber: accepted.contactNumber,
      emergencyType: accepted.emergencyType,
      address: accepted.address,
      status: "completed",
      liveLocation: accepted.liveLocation,
      acceptedAt: accepted.acceptedAt,
      completedAt: new Date(),
      media: mediaFiles,
    });
    await completed.save();

    res.json({ success: true, data: completed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params; // alert id
    const { lat, lng } = req.body;

    const updated = await AcceptedAlert.findOneAndUpdate(
      { originalAlertId: id },
      { "liveLocation.coordinates": [lng, lat] },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRespondersForAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const accepted = await AcceptedAlert.findOne({ originalAlertId: id });
    if (!accepted)
      return res
        .status(404)
        .json({ success: false, message: "Accepted alert not found" });

    const sosLocation = accepted.liveLocation?.coordinates
      ? {
          lat: accepted.liveLocation.coordinates[1],
          lng: accepted.liveLocation.coordinates[0],
          type: "sos",
        }
      : null;

    // Example responder locations
    const responders = [
      { lat: 6.9271, lng: 79.8612, type: "responder" },
      { lat: 6.9355, lng: 79.8478, type: "responder" },
    ];

    res.json({
      success: true,
      data: { sos: sosLocation, responders },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getAllAlerts,
  getAllAcceptedAlerts,
  getAlertsByStatus,
  acceptAlert,
  cancelAlert,
  markAsReached,
  completeAlert,
  updateResponderLocation,
  getRespondersForAlert,
};