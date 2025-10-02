// controller/controller.js
import mongoose from "mongoose";
import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";
import CompletedAlert from "../model/completedAlertModel.js";
import CanceledAlert from "../model/canceledAlerts.js";


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllAcceptedAlerts = async (req, res) => {
  try {
    const alerts = await AcceptedAlert.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllAcceptedAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const alerts = await Alert.find({ status });
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAlertsByStatus error:", error);
    res.status(500).json({ error: error.message });
  }
};

const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
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

    const alert =
      (await Alert.findById(id)) ||
      (await AcceptedAlert.findById(id)) ||
      (await CompletedAlert.findById(id));

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

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.status = "accepted";
    await alert.save();

    const accepted = new AcceptedAlert({
      ...alert.toObject(),
      status: "accepted",
    });
    await accepted.save();

    res.json({
      message: `Alert ${alert.reportId} accepted successfully`,
      alert,
      accepted,
    });
  } catch (error) {
    console.error("❌ acceptAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reasons } = req.body; // get reasons from frontend checkboxes

    const alert = await AcceptedAlert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const canceled = new CanceledAlert({
      ...alert.toObject(),
      status: "cancelled",
      reasonToReject: reasons.join(", "),
      cancelledAt: new Date(),
    });
    await canceled.save();

    await AcceptedAlert.findByIdAndDelete(id);
    await Alert.findByIdAndUpdate(id, { status: "cancelled", reasonToReject: reasons.join(", ") });

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

    const update = { status: "reached" };
    const alert =
      (await AcceptedAlert.findByIdAndUpdate(id, update, { new: true })) ||
      (await Alert.findByIdAndUpdate(id, update, { new: true }));

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

    const files = req.files || [];

    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    // Look for the alert in Accepted or Pending collections
    const alert =
      (await AcceptedAlert.findById(id)) || (await Alert.findById(id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // Create CompletedAlert
    const completed = new CompletedAlert({
      ...alert.toObject(),
      comment,
      commentBy,
      commentByNIC,
      commentByContactNumber,
      accuracyRating,
      casualities: casualties, // notice schema typo → "casualities"
      fatalities,
      criticalInjuries,
      uninjured,
      reason,
      media: files.map((f) => f.filename),
      completedAt: new Date(),
      status: "completed",
    });

    await completed.save();

    // Remove from active collections
    await AcceptedAlert.findByIdAndDelete(id);
    await Alert.findByIdAndDelete(id);

    // 📝 Generate Completion Report
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
        total: completed.casualities || 0,
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

    const update = { responderLocation: { lat, lng } };

    const alert =
      (await AcceptedAlert.findByIdAndUpdate(id, update, { new: true })) ||
      (await Alert.findByIdAndUpdate(id, update, { new: true }));

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

    const alert =
      (await AcceptedAlert.findById(id)) ||
      (await Alert.findById(id)) ||
      (await CompletedAlert.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert.responders || []);
  } catch (error) {
    console.error("❌ getRespondersForAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAllAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    await AcceptedAlert.deleteMany({});
    await CompletedAlert.deleteMany({});
    res.json({ message: "All alerts deleted from all databases" });
  } catch (error) {
    console.error("❌ deleteAllAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllCompletedAlerts = async (req, res) => {
  try {
    const alerts = await CompletedAlert.find();
    res.json(alerts);
  } catch (error) {
    console.error("❌ getAllCompletedAlerts error:", error);
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
};
