// controllers/responderController.js
import Responder from "../model/Responder.js";

// ✅ Create a new responder
export const createResponder = async (req, res) => {
  try {
    const { latitude, longitude } = req.body.lastLocation || {};
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Responder location is required" });
    }

    const responder = new Responder({
      ...req.body,
      lastLocation: {
        latitude,
        longitude,
        mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
      },
    });

    const savedResponder = await responder.save();
    res.status(201).json(savedResponder);
  } catch (error) {
    console.error("Error creating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all responders
export const getResponders = async (req, res) => {
  try {
    const responders = await Responder.find();
    res.status(200).json(responders);
  } catch (error) {
    console.error("Error fetching responders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update responder
export const updateResponder = async (req, res) => {
  try {
    const { latitude, longitude } = req.body.lastLocation || {};
    if (latitude && longitude) {
      req.body.lastLocation = {
        latitude,
        longitude,
        mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
      };
    }

    const updated = await Responder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Responder not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete responder
export const deleteResponder = async (req, res) => {
  try {
    const deleted = await Responder.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder deleted successfully" });
  } catch (error) {
    console.error("Error deleting responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Patch responder status
export const patchResponderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const responder = await Responder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!responder)
      return res.status(404).json({ message: "Responder not found" });

    res.json(responder);
  } catch (err) {
    console.error("Error patching responder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get responders by responder type
export const getRespondersByType = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Responder type is required" });
    }

    const responders = await Responder.find({
      responderType: type,
      status: "available",
    });

    res.status(200).json(responders);
  } catch (error) {
    console.error("Error fetching responders by type:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
