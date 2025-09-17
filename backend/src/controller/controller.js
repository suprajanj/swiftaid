import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import alert from "../model/emergencymodel.js"; // Your Mongoose model

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await alert.find().select("-__v").sort({ timestamp: -1 });
    if (!alerts || alerts.length === 0) {
      return res.status(404).json({ message: "No alerts found" });
    }
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Accept an alert (set status = "Accepted")
import Alert from "../models/alertModel.js"; // make sure you import your model

const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { status: "Accepted" },
      { new: true, runValidators: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.status(200).json({
      message: "Alert accepted successfully",
      alert: updatedAlert,
    });
  } catch (error) {
    console.error("Error accepting alert:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 📌 Update alert status (PATCH)
const displayAlertDetails = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "Accepted", "resolved", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  try {
    const updatedAlert = await alert.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedAlert) return res.status(404).json({ message: "Alert not found" });

    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Add a new alert
const addAlert = async (req, res) => {
  try {
    const { reportId, userId, NIC, contactNumber, emergencyType, liveLocation, address, priorityLevel } = req.body;

    const newAlert = new alert({
      reportId,
      userId,
      NIC,
      contactNumber,
      emergencyType,
      liveLocation,
      address,
      priorityLevel,
      createdAt: new Date()
    });

    const savedAlert = await newAlert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Proper named exports (ES Modules)
export { getAllAlerts, acceptAlert, displayAlertDetails, addAlert };
