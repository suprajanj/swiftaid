import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  updateAccess,
  getOrganizationStats
} from "../controllers/organizationController.js";

const router = express.Router();

// Organization routes
router.post("/", createOrganization);
router.get("/", getAllOrganizations);
router.get("/stats", getOrganizationStats);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);
router.patch("/:id/access", updateAccess);

export default router;
