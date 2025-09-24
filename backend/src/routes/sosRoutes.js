import express from "express";
import { assignResponder } from "../controllers/sosController.js";
import {
  createSOS,
  deleteSOS,
  getAllsos,
  updateSOS,
  getSOSByID,
} from "../controllers/sosController.js";

const router = express.Router();

router.get("/", getAllsos);

router.post("/", createSOS);

router.post("/assign", assignResponder);

router.get("/:id", getSOSByID);

router.put("/:id", updateSOS);

router.delete("/:id", deleteSOS);


export default router;