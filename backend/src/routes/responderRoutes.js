import express from "express";
import {
  createResponder,
  getResponders,
  updateResponder,
  deleteResponder,
  patchResponder,
  getRespondersByType,
} from "../controllers/responderController.js";

const router = express.Router();

// ✅ CRUD endpoints
router.post("/", createResponder);         // Create a responder
router.get("/", getResponders);            // Get all responders
router.put("/:id", updateResponder);       // Update responder (full update)
router.delete("/:id", deleteResponder);    // Delete responder
router.patch("/:id", patchResponder);      // Update responder availability


router.get("/by-type", getRespondersByType);

export default router;