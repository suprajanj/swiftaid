// backend/routes/routes.js
import express from "express";
import multer from "multer";
import {
  getAllAlerts,
  acceptAlert,
  getAcceptedAlerts,
  displayAlertDetails,
  addAlert,
  updateAcceptedAlertAndMoveToCompleted,
} from "../controller/controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/alerts", getAllAlerts);
router.put("/alerts/:id/accept", acceptAlert);
router.get("/alerts/:id", displayAlertDetails);
router.post("/alerts", addAlert);
router.get("/alerts/accepted", getAcceptedAlerts);
router.put(
  "/alerts/complete",
  upload.fields([{ name: "photos" }, { name: "videos" }]),
  updateAcceptedAlertAndMoveToCompleted
);

export default router;