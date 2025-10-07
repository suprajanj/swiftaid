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

router.get("/", getAllSOS);
router.post("/", createSOS);
router.get("/:id", getSOSByID);
router.put("/:id", updateSOS);
router.delete("/:id", deleteSOS);
router.patch("/assign", assignResponder);
router.patch("/:id/complete", completeSOS);

export default router;
