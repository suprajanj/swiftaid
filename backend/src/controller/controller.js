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

    const accepted = new AcceptedAlert({ ...alert.toObject(), status: "accepted" });
    await accepted.save();

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
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAcceptedAlertAndMoveToCompleted = async (req, res) => {
  try {
    const { reportId } = req.body;
    const photos = req.files?.photos?.map((file) => file.path) || [];
    const videos = req.files?.videos?.map((file) => file.path) || [];

    const updatedAcceptedAlert = await AcceptedAlert.findOneAndUpdate(
      { reportId },
      { $set: { photos, videos, status: "resolved" } },
      { new: true }
    );

    if (!updatedAcceptedAlert) {
      return res.status(404).json({ message: "Accepted alert not found" });
    }

    const completedTask = new CompletedTask(updatedAcceptedAlert.toObject());
    await completedTask.save();

    res.status(200).json({
      message: "✅ Task completed and moved to CompletedTasks",
      updatedAcceptedAlert,
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