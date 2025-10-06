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
  changePassword,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logoutUser); // no protect

router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Backwards-compatible update endpoint (optional)
router.put("/update/:id", updateUser);

// Existing user management routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
