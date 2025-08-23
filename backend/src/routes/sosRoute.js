import express from "express";
import {
  createSOS,
  deleteSOS,
  getAllsos,
  updateSOS,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllsos);

router.post("/", createSOS);

router.put("/:id", updateSOS);

router.delete("/:id", deleteSOS);

export default router;
