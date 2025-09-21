import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createUser,
  loginUser,
  verifyOTP,
  logoutUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logoutUser); // no protect

router.get("/me", protect, getMe);

// User management routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
