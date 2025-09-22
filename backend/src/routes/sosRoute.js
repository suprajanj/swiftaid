import express from "express";
import {
  createSOS,
  deleteSOS,
  getAllsos,
  updateSOS,
  getSOSByID,
  getSOSByUser,
} from "../controllers/sosController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllsos); // Get all SOS
router.get("/user/:userId", protect, getSOSByUser); // ✅ must come before /:id
router.get("/:id", getSOSByID); // Get SOS by ID

// Protected routes
router.post("/", protect, createSOS); // Create new SOS
router.put("/:id", protect, updateSOS); // Update SOS
router.delete("/:id", deleteSOS); // Delete SOS

export default router;
