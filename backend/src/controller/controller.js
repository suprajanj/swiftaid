// backend/controller/controller.js
import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";
import CompletedTask from "../model/completedTaskModel.js";

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // ✅ Check if already accepted
    const alreadyAccepted = await AcceptedAlert.findOne({ reportId: alert.reportId });
    if (alreadyAccepted) {
      return res.status(400).json({ message: "This alert is already accepted" });
    }

    // ✅ Create Accepted Alert
    const accepted = new AcceptedAlert({ ...alert.toObject(), status: "accepted" });
    await accepted.save();

    // ✅ Update original alert status
    alert.status = "accepted";
    await alert.save();

    res.json({ message: "Alert accepted successfully", accepted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAcceptedAlerts = async (req, res) => {
  try {
    const acceptedAlerts = await AcceptedAlert.find().sort({ timestamp: -1 });
    res.json(acceptedAlerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const displayAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addAlert = async (req, res) => {
  try {
    if (!req.body || !req.body.reportId) {
      return res.status(400).json({ message: "Invalid alert data" });
    }

    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAcceptedAlertAndMoveToCompleted = async (req, res) => {
  try {
    const { reportId, updateData } = req.body;

    if (!reportId) {
      return res.status(400).json({ message: "reportId is required" });
    }

    const updatedAcceptedAlert = await AcceptedAlert.findOneAndUpdate(
      { reportId },
      { $set: { ...updateData, status: "completed" } },
      { new: true }
    );

    if (!updatedAcceptedAlert) {
      return res.status(404).json({ message: "Accepted alert not found" });
    }

    // ✅ Move to CompletedTask collection
    const completedTask = new CompletedTask(updatedAcceptedAlert.toObject());
    await completedTask.save();

    // ✅ Remove from AcceptedAlert to keep DB clean
    await AcceptedAlert.deleteOne({ reportId });

    res.status(200).json({
      message: "✅ Accepted alert updated, moved to completed tasks and removed from active list",
      completedTask,
    });
  } catch (error) {
    console.error("❌ Error updating alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getAllAlerts,
  acceptAlert,
  getAcceptedAlerts,
  displayAlertDetails,
  addAlert,
  updateAcceptedAlertAndMoveToCompleted,
};
