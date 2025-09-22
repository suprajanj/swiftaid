import express from "express";
import {
  createEmergencyCase,
  getEmergencyCases,
  getEmergencyCaseById,
  updateEmergencyCase,
  verifyEmergencyCase,
  submitReport,
  getEmergencyCaseStats,
  exportEmergencyCases
} from "../controllers/emergencyCaseController.js";

const router = express.Router();

// Emergency Case routes
router.post("/", createEmergencyCase);
router.get("/", getEmergencyCases);
router.get("/stats", getEmergencyCaseStats);
router.get("/export", exportEmergencyCases);
router.get("/:id", getEmergencyCaseById);
router.put("/:id", updateEmergencyCase);
router.patch("/:id/verify", verifyEmergencyCase);
router.post("/:id/reports", submitReport);

export default router;
