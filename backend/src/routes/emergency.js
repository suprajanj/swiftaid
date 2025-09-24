import express from "express";
const router = express.Router();
import Emergency from "../models/Emergency.js";

// Create new emergency case
router.post("/", async (req, res) => {
  try {
    const { name, age, number, emergencyType, assignedResponder, latitude, longitude, mapLink } = req.body;

    const emergency = new Emergency({
      name,
      age,
      number,
      emergencyType,
      assignedResponder,
      location: { latitude, longitude, mapLink },
    });

    await emergency.save();
    res.status(201).json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
