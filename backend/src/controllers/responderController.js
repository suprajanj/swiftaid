// backend/controllers/responderController.js
import Responder from "../models/Responder.js";

// Create responder
export const createResponder = async (req, res) => {
  try {
    const responder = new Responder(req.body);
    const savedResponder = await responder.save();
    res.status(201).json(savedResponder);
  } catch (error) {
    console.error("Error creating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all responders
export const getResponders = async (req, res) => {
  try {
    const responders = await Responder.find();
    res.status(200).json(responders);
  } catch (error) {
    console.error("Error fetching responders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update responder
export const updateResponder = async (req, res) => {
  try {
    const updated = await Responder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete responder
export const deleteResponder = async (req, res) => {
  try {
    const deleted = await Responder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder deleted" });
  } catch (error) {
    console.error("Error deleting responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const patchResponder = async (req, res) => {
   try {
    const { availability } = req.body;

    const responder = await Responder.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!responder) return res.status(404).json({ message: "Responder not found" });

    res.json(responder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};