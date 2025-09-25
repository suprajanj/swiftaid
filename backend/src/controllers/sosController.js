// controllers/sosController.js
import SOS from "../models/sos.js";
import Responder from "../models/Responder.js";

// Get all SOS records
export const getAllSOS = async (req, res) => {
  try {
    const sosList = await SOS.find().populate("assignedResponder", "name number");
    res.status(200).json(sosList);
  } catch (err) {
    console.error("Error fetching SOS records:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get SOS by ID
export const getSOSByID = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id).populate("assignedResponder", "name number");
    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json(sos);
  } catch (err) {
    console.error("Error fetching SOS by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new SOS
export const createSOS = async (req, res) => {
  try {
    const { name, age, number, emergencyType, location } = req.body;

    if (!name || !age || !number || !emergencyType)
      return res.status(400).json({ message: "Missing required fields" });

    if (!location?.latitude || !location?.longitude)
      return res.status(400).json({ message: "Location is required" });

    const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    const sos = new SOS({
      name,
      age,
      number,
      emergencyType,
      location: { ...location, mapLink },
      status: "Pending", // New SOS starts as Pending
    });

    const savedSOS = await sos.save();
    res.status(201).json(savedSOS);
  } catch (err) {
    console.error("Error creating SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update SOS (with automatic unassign if emergencyType changes)
export const updateSOS = async (req, res) => {
  try {
    const { name, age, number, emergencyType, location, status } = req.body;

    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    // If emergencyType changes, unassign responder
    if (emergencyType && sos.emergencyType !== emergencyType && sos.assignedResponder) {
      const prevResponder = await Responder.findById(sos.assignedResponder);
      if (prevResponder) {
        prevResponder.availability = true;
        await prevResponder.save();
      }
      sos.assignedResponder = null; // Unassign
      sos.status = "Pending"; // Reset status
    }

    sos.name = name || sos.name;
    sos.age = age || sos.age;
    sos.number = number || sos.number;
    sos.emergencyType = emergencyType || sos.emergencyType;

    if (location?.latitude && location?.longitude) {
      sos.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        mapLink: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
      };
    }

    if (status) {
      sos.status = status; // Allow manual status update
    }

    const updatedSOS = await sos.save();
    const populatedSOS = await updatedSOS.populate("assignedResponder", "name number");
    res.status(200).json(populatedSOS);
  } catch (err) {
    console.error("Error updating SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete SOS
export const deleteSOS = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    // If SOS has a responder assigned, make them available
    if (sos.assignedResponder) {
      const responder = await Responder.findById(sos.assignedResponder);
      if (responder) {
        responder.availability = true;
        await responder.save();
      }
    }

    await SOS.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "SOS deleted successfully" });
  } catch (err) {
    console.error("Error deleting SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Assign a responder to SOS and update status
export const assignResponder = async (req, res) => {
  try {
    const { sosId, responderId } = req.body;

    const sos = await SOS.findById(sosId);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    const responder = await Responder.findById(responderId);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    // Assign responder and mark SOS as Assigned
    sos.assignedResponder = responder._id;
    sos.status = "Assigned";
    await sos.save();

    // Mark responder as busy
    responder.availability = false;
    await responder.save();

    res.status(200).json({ sos, responder });
  } catch (err) {
    console.error("Error assigning responder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const completeSOS = async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: "Completed", completedAt: new Date() },
      { new: true }
    );
    if (!sos) return res.status(404).json({ error: "SOS not found" });
    res.json(sos);
  } catch (err) {
    res.status(500).json({ error: "Failed to complete SOS" });
  }
}
