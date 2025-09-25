// routes/sosRoutes.js
import express from "express";
import {
  getAllSOS,
  getSOSByID,
  createSOS,
  updateSOS,
  deleteSOS,
  assignResponder,
  completeSOS,
} from "../controllers/sosController.js";

const router = express.Router();

// Get all SOS records
router.get("/", getAllSOS);

// Create new SOS
router.post("/", createSOS);

// Assign a responder to a SOS
router.patch("/assign", assignResponder);

// Get SOS by ID
router.get("/:id", getSOSByID);

// Update SOS by ID
router.put("/:id", updateSOS);

// Delete SOS by ID
router.delete("/:id", deleteSOS);


router.patch("/:id/complete", completeSOS)
export default router;
