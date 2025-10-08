import express from "express";
import {
  createSOS,
  deleteSOS,
  getAllsos,
  updateSOS,
  getSOSByID,
  getSOSByUser,
  getResAllSOS,
  getResSOSByID,
  createResSOS,
  updateResSOS,
  deleteResSOS,
  assignResponder,
  completeResSOS
} from "../controllers/sosController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllsos); // Get all SOS
router.get("/user/:userId", protect, getSOSByUser); // Get SOS by user ID

// Responder routes - must come before /:id
router.get("/res", getResAllSOS);
router.post("/res", createResSOS);
router.get("/res/:id", getResSOSByID);
router.put("/res/:id", updateResSOS);
router.delete("/res/:id", deleteResSOS);
router.patch("/res/assign", assignResponder);
router.patch("/res/:id/complete", completeResSOS);

// Regular SOS routes
router.get("/:id", getSOSByID); // Get SOS by ID (must come after /res routes)
router.post("/", protect, createSOS); // Create new SOS
router.put("/:id", protect, updateSOS); // Update SOS
router.delete("/:id", deleteSOS); // Delete SOS

export default router;
