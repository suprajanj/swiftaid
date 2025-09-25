import express from "express";
import {
  getEmergencyCases,
  getEmergencyCaseById,
  createEmergencyCase,
  submitReport
} from "../controllers/emergencyCaseController.js";

const router = express.Router();

router.get("/", getEmergencyCases);
router.get("/:id", getEmergencyCaseById);
router.post("/", createEmergencyCase);
router.post("/:id/reports", submitReport);

export default router;
