// routes/userRoute.js (partial — add this)
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

// Backwards-compatible update endpoint (optional)
router.put("/update/:id", updateUser);

// Existing user management routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
