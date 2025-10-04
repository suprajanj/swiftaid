// src/controllers/controller.js
import mongoose from "mongoose";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// helper to get models from global (throws if not present)
const getModels = () => {
  const {
    AlertModel,
    AcceptedAlertModel,
    CompletedAlertModel,
    CanceledAlertModel,
    ResponderModel,
  } = global;

  if (!AlertModel || !AcceptedAlertModel || !CompletedAlertModel || !CanceledAlertModel || !ResponderModel) {
    throw new Error("Models are not registered on DB connections (server.js must register schemas)");
  }

  return { AlertModel, AcceptedAlertModel, CompletedAlertModel, CanceledAlertModel, ResponderModel };
};

// GET all pending alerts
const getAllAlerts = async (req, res) => {
  try {
    const { AlertModel } = getModels();
    const alerts = await AlertModel.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllAcceptedAlerts = async (req, res) => {
  try {
    const { AcceptedAlertModel } = getModels();
    const alerts = await AcceptedAlertModel.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllAcceptedAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { AlertModel } = getModels();
    const alerts = await AlertModel.find({ status });
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAlertsByStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};

const addAlert = async (req, res) => {
  try {
    const { AlertModel } = getModels();
    const alert = new AlertModel(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error("❌ addAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const displayAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel, CompletedAlertModel } = getModels();

    // Try lookup across collections by _id
    const alert =
      (await AlertModel.findById(id)) ||
      (await AcceptedAlertModel.findById(id)) ||
      (await CompletedAlertModel.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    console.error("❌ displayAlertDetails error:", error);
    res.status(500).json({ error: error.message });
  }
};

const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels();

    const alert = await AlertModel.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.status = "accepted";
    await alert.save();

    const accepted = new AcceptedAlertModel({
      ...alert.toObject(),
      status: "accepted",
      acceptedAt: new Date(),
    });

    // ensure we don't accidentally include _id duplicates
    delete accepted._id;
    await accepted.save();

    res.json({ message: `Alert ${alert.reportId} accepted successfully`, alert, accepted });
  } catch (error) {
    console.error("❌ acceptAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reasons = [] } = req.body;

    const { AcceptedAlertModel, CanceledAlertModel, AlertModel } = getModels();

    const alert = await AcceptedAlertModel.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const canceled = new CanceledAlertModel({
      ...alert.toObject(),
      status: "cancelled",
      reasonToReject: Array.isArray(reasons) ? reasons.join(", ") : String(reasons),
      cancelledAt: new Date(),
    });

    delete canceled._id;
    await canceled.save();

    await AcceptedAlertModel.findByIdAndDelete(id);
    // mark pending collection status too if that exists
    await AlertModel.findOneAndUpdate({ reportId: alert.reportId }, { status: "cancelled", reasonToReject: canceled.reasonToReject });

    res.json({ message: "Alert cancelled successfully", canceled });
  } catch (error) {
    console.error("❌ cancelAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AcceptedAlertModel, AlertModel } = getModels();

    const update = { status: "reached" };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({ message: "Responder reached", alert });
  } catch (error) {
    console.error("❌ markAsReached error:", error);
    res.status(500).json({ error: error.message });
  }
};

const completeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      comment,
      commentBy,
      commentByNIC,
      commentByContactNumber,
      accuracyRating,
      casualties,
      fatalities,
      criticalInjuries,
      uninjured,
      reason,
    } = req.body;

    // files are optional — if you're using multer you'll get req.files
    const files = req.files || [];

    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AcceptedAlertModel, AlertModel, CompletedAlertModel } = getModels();

    const alert = (await AcceptedAlertModel.findById(id)) || (await AlertModel.findById(id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const completed = new CompletedAlertModel({
      ...alert.toObject(),
      comment,
      commentBy,
      commentByNIC,
      commentByContactNumber,
      accuracyRating,
      casualties: casualties || 0,
      fatalities,
      criticalInjuries,
      uninjured,
      reason,
      media: files.map((f) => f.filename || f.path),
      completedAt: new Date(),
      status: "completed",
    });

    delete completed._id;
    await completed.save();

    // clean up from active collections
    if (await AcceptedAlertModel.exists({ _id: id })) await AcceptedAlertModel.findByIdAndDelete(id);
    if (await AlertModel.exists({ _id: id })) await AlertModel.findByIdAndDelete(id);

    // build a report object to return
    const report = {
      reportId: completed.reportId,
      userId: completed.userId,
      emergencyType: completed.emergencyType,
      address: completed.address,
      status: completed.status,
      completedAt: completed.completedAt,
      comment: completed.comment,
      commentBy: completed.commentBy,
      commentByNIC: completed.commentByNIC,
      commentByContactNumber: completed.commentByContactNumber,
      accuracyRating: completed.accuracyRating,
      casualties: {
        total: completed.casualties || 0,
        fatalities: completed.fatalities || 0,
        criticalInjuries: completed.criticalInjuries || 0,
        uninjured: completed.uninjured || 0,
      },
      reason: completed.reason,
      media: completed.media,
    };

    res.json({ message: "✅ Alert completed successfully", report });
  } catch (error) {
    console.error("❌ completeAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AcceptedAlertModel, AlertModel } = getModels();

    const update = { responderLocation: { lat, lng } };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({ message: "Responder location updated", alert });
  } catch (error) {
    console.error("❌ updateResponderLocation error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getRespondersForAlert = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AcceptedAlertModel, AlertModel, CompletedAlertModel } = getModels();

    const alert =
      (await AcceptedAlertModel.findById(id)) ||
      (await AlertModel.findById(id)) ||
      (await CompletedAlertModel.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert.responders || []);
  } catch (error) {
    console.error("❌ getRespondersForAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAllAlerts = async (req, res) => {
  try {
    const { AlertModel, AcceptedAlertModel, CompletedAlertModel } = getModels();
    await AlertModel.deleteMany({});
    await AcceptedAlertModel.deleteMany({});
    await CompletedAlertModel.deleteMany({});
    res.json({ message: "All alerts deleted from all databases" });
  } catch (error) {
    console.error("❌ deleteAllAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllCompletedAlerts = async (req, res) => {
  try {
    const { CompletedAlertModel } = getModels();
    const alerts = await CompletedAlertModel.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllCompletedAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Responder creation controller
const createNewResponder = async (req, res) => {
  try {
    const { NIC, name, contactNumber, email, address, password, position, emergencyType } = req.body;
    const { ResponderModel } = getModels();

    if (!NIC || !name || !contactNumber || !email || !address || !password || !position || !emergencyType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await ResponderModel.findOne({ NIC });
    if (existing) return res.status(400).json({ error: "Responder with this NIC already exists" });

    const newResponder = new ResponderModel({
      NIC,
      name,
      contactNumber,
      email,
      address,
      password,
      position,
      emergencyType,
    });

    await newResponder.save();
    res.status(201).json(newResponder);
  } catch (error) {
    console.error("❌ createNewResponder error:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllAlerts,
  getAllAcceptedAlerts,
  getAlertsByStatus,
  addAlert,
  displayAlertDetails,
  acceptAlert,
  cancelAlert,
  markAsReached,
  completeAlert,
  updateResponderLocation,
  getRespondersForAlert,
  deleteAllAlerts,
  getAllCompletedAlerts,
  createNewResponder,
};
