// routes/responderRoutes.js
import express from "express";
import {
  createResponder,
  getResponders,
  updateResponder,
  deleteResponder,
  patchResponderStatus,
  getRespondersByType,
} from "../controllers/responderController.js";

const router = express.Router();

// ✅ CRUD operations
router.post("/", createResponder);
router.get("/", getResponders);
router.put("/:id", updateResponder);
router.delete("/:id", deleteResponder);
router.patch("/:id/status", patchResponderStatus);

// ✅ Get responders by type (for assigning in Admin Panel)
router.get("/by-type", getRespondersByType);

export default router;
