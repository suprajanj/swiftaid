import express from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  loginUser,
  verifyOTP,
} from "../controllers/userController.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/", createUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);

//Verify OTP
router.post("/verify-otp", verifyOTP);

export default router;
