import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";

// Create Organization
export const createOrganization = async (req, res) => {
  try {
    const {
      name,
      email,
      organizationType,
      contactPerson,
      phone,
      address,
      registrationNumber,
      accessLevel,
      allowedRegions,
      allowedIncidentTypes,
    } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message:
          "Organization with this email or registration number already exists",
      });
    }

    const organization = new Organization({
      name,
      email,
      organizationType,
      contactPerson,
      phone,
      address,
      registrationNumber,
      accessLevel,
      allowedRegions,
      allowedIncidentTypes,
      createdBy: req.adminId || req.body.createdBy,
    });

    await organization.save();

    // Log the action
    await AuditLog.create({
      action: "CREATE_ORGANIZATION",
      entityType: "Organization",
      entityId: organization._id,
      performedBy: req.adminId || req.body.createdBy,
      performedByModel: "Admin",
      details: { organizationType, accessLevel },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get All Organizations (with filtering)
export const getAllOrganizations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      organizationType,
      isActive,
      accessLevel,
      search,
    } = req.query;

    const filter = {};

    if (organizationType) filter.organizationType = organizationType;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (accessLevel) filter.accessLevel = accessLevel;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const organizations = await Organization.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: "UPDATE_ORGANIZATION",
      entityType: "Organization",
      entityId: organization._id,
      performedBy: req.adminId || req.body.updatedBy,
      performedByModel: "Admin",
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete Organization (Soft Delete)
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: "DELETE_ORGANIZATION",
      entityType: "Organization",
      entityId: organization._id,
      performedBy: req.adminId || req.body.deletedBy,
      performedByModel: "Admin",
      details: { reason: "Soft delete - access revoked" },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Organization access revoked successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Grant/Revoke Access
export const updateAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessLevel, allowedRegions, allowedIncidentTypes, isActive } =
      req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      {
        accessLevel,
        allowedRegions,
        allowedIncidentTypes,
        isActive,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: isActive ? "GRANT_ACCESS" : "REVOKE_ACCESS",
      entityType: "Access",
      entityId: organization._id,
      performedBy: req.adminId || req.body.updatedBy,
      performedByModel: "Admin",
      details: { accessLevel, allowedRegions, allowedIncidentTypes, isActive },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: `Access ${isActive ? "granted" : "revoked"} successfully`,
      data: organization,
    });
  } catch (error) {
    console.error("Error updating access:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Organization Statistics
export const getOrganizationStats = async (req, res) => {
  try {
    const stats = await Organization.aggregate([
      {
        $group: {
          _id: "$organizationType",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
    ]);

    const totalOrganizations = await Organization.countDocuments();
    const activeOrganizations = await Organization.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalOrganizations,
        active: activeOrganizations,
        byType: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
