import express from "express";
import {
  createSOS,
  deleteSOS,
  getAllsos,
  updateSOS,
  getSOSByID,
} from "../controllers/sosController.js";

const router = express.Router();

router.get("/", getAllsos);

router.get("/:id", getSOSByID);

router.post("/", createSOS);

router.put("/:id", updateSOS);

router.delete("/:id", deleteSOS);

export default router;