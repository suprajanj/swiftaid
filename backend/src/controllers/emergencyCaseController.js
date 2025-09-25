import EmergencyCase from "../models/EmergencyCase.js";
import Organization from "../models/Organization.js";
import AuditLog from "../models/AuditLog.js";
import Admin from "../models/Admin.js"; // Add this

// Create Emergency Case
export const createEmergencyCase = async (req, res) => {
  try {
    const {
      title,
      description,
      incidentType,
      severity,
      location,
      dateTime,
      affectedPeople,
      assignedAgencies,
      tags,
    } = req.body;

    const emergencyCase = new EmergencyCase({
      caseId: `CASE-${Date.now()}`,
      title,
      description,
      incidentType,
      severity,
      location,
      dateTime: dateTime || new Date(),
      affectedPeople,
      assignedAgencies,
      tags,
      createdBy: req.adminId || null,
    });

    await emergencyCase.save();

    // Log the action
    await AuditLog.create({
      action: "CREATE_CASE",
      entityType: "EmergencyCase",
      entityId: emergencyCase._id,
      performedBy: req.adminId || req.body.createdBy,
      performedByModel: "Admin",
      details: { incidentType, severity, caseId: emergencyCase.caseId },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      success: true,
      message: "Emergency case created successfully",
      data: emergencyCase,
    });
  } catch (error) {
    console.error("Error creating emergency case:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Emergency Cases (with filtering for organizations)
export const getEmergencyCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      incidentType,
      severity,
      district,
      state,
      status,
      isVerified,
      startDate,
      endDate,
      search,
    } = req.query;

    // Get organization info if provided
    let organization = null;
    if (req.organizationId) {
      organization = await Organization.findById(req.organizationId);
      if (!organization || !organization.isActive) {
        return res.status(403).json({
          success: false,
          message: "Organization access denied",
        });
      }
    }

    const filter = {};

    // Only show verified cases to organizations
    if (req.organizationId) {
      filter["verificationStatus.isVerified"] = true;
      filter.isPublic = true;

      // Apply organization-specific filters
      if (
        organization.allowedRegions &&
        organization.allowedRegions.length > 0
      ) {
        filter["location.district"] = { $in: organization.allowedRegions };
      }

      if (
        organization.allowedIncidentTypes &&
        organization.allowedIncidentTypes.length > 0
      ) {
        filter.incidentType = { $in: organization.allowedIncidentTypes };
      }
    } else {
      // Admin can see all cases
      if (isVerified !== undefined) {
        filter["verificationStatus.isVerified"] = isVerified === "true";
      }
    }

    if (incidentType) filter.incidentType = incidentType;
    if (severity) filter.severity = severity;
    if (district) filter["location.district"] = district;
    if (state) filter["location.state"] = state;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { caseId: { $regex: search, $options: "i" } },
      ];
    }

    const emergencyCases = await EmergencyCase.find(filter)
      .populate("createdBy", "name email") // uses Admin model now
      .populate("verificationStatus.verifiedBy", "name email")
      .sort({ dateTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EmergencyCase.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: emergencyCases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching emergency cases:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Emergency Case by ID
export const getEmergencyCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const emergencyCase = await EmergencyCase.findById(id)
      .populate("createdBy", "name email")
      .populate("verificationStatus.verifiedBy", "name email")
      .populate("reports.submittedBy", "name organizationType");

    if (!emergencyCase) {
      return res.status(404).json({
        success: false,
        message: "Emergency case not found",
      });
    }

    // Check organization access
    if (req.organizationId) {
      const organization = await Organization.findById(req.organizationId);
      if (!organization || !organization.isActive) {
        return res.status(403).json({
          success: false,
          message: "Organization access denied",
        });
      }

      // Check if organization has access to this case
      if (
        !emergencyCase.verificationStatus.isVerified ||
        !emergencyCase.isPublic
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this case",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: emergencyCase,
    });
  } catch (error) {
    console.error("Error fetching emergency case:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Emergency Case
export const updateEmergencyCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;

    const emergencyCase = await EmergencyCase.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!emergencyCase) {
      return res.status(404).json({
        success: false,
        message: "Emergency case not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: "UPDATE_CASE",
      entityType: "EmergencyCase",
      entityId: emergencyCase._id,
      performedBy: req.adminId || req.body.updatedBy,
      performedByModel: "Admin",
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Emergency case updated successfully",
      data: emergencyCase,
    });
  } catch (error) {
    console.error("Error updating emergency case:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Verify Emergency Case
export const verifyEmergencyCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationNotes, isVerified } = req.body;

    const emergencyCase = await EmergencyCase.findByIdAndUpdate(
      id,
      {
        "verificationStatus.isVerified": isVerified,
        "verificationStatus.verifiedBy": req.adminId || req.body.verifiedBy,
        "verificationStatus.verifiedAt": new Date(),
        "verificationStatus.verificationNotes": verificationNotes,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!emergencyCase) {
      return res.status(404).json({
        success: false,
        message: "Emergency case not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: "VERIFY_CASE",
      entityType: "EmergencyCase",
      entityId: emergencyCase._id,
      performedBy: req.adminId || req.body.verifiedBy,
      performedByModel: "Admin",
      details: { isVerified, verificationNotes },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: `Emergency case ${
        isVerified ? "verified" : "unverified"
      } successfully`,
      data: emergencyCase,
    });
  } catch (error) {
    console.error("Error verifying emergency case:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Submit Report
export const submitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType, content } = req.body;

    if (!req.organizationId) {
      return res.status(403).json({
        success: false,
        message: "Only organizations can submit reports",
      });
    }

    const emergencyCase = await EmergencyCase.findByIdAndUpdate(
      id,
      {
        $push: {
          reports: {
            reportType,
            content,
            submittedBy: req.organizationId,
            submittedAt: new Date(),
          },
        },
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!emergencyCase) {
      return res.status(404).json({
        success: false,
        message: "Emergency case not found",
      });
    }

    // Log the action
    await AuditLog.create({
      action: "SUBMIT_REPORT",
      entityType: "Report",
      entityId: emergencyCase._id,
      performedBy: req.organizationId,
      performedByModel: "Organization",
      details: { reportType, content },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      message: "Report submitted successfully",
      data: emergencyCase,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Emergency Case Statistics
export const getEmergencyCaseStats = async (req, res) => {
  try {
    const stats = await EmergencyCase.aggregate([
      {
        $group: {
          _id: "$incidentType",
          count: { $sum: 1 },
          verified: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus.isVerified", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalCases = await EmergencyCase.countDocuments();
    const verifiedCases = await EmergencyCase.countDocuments({
      "verificationStatus.isVerified": true,
    });
    const publicCases = await EmergencyCase.countDocuments({ isPublic: true });

    res.status(200).json({
      success: true,
      data: {
        total: totalCases,
        verified: verifiedCases,
        public: publicCases,
        byType: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching emergency case stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Export Emergency Cases
export const exportEmergencyCases = async (req, res) => {
  try {
    const {
      incidentType,
      district,
      state,
      startDate,
      endDate,
      format = "json",
    } = req.query;

    const filter = { "verificationStatus.isVerified": true };

    if (incidentType) filter.incidentType = incidentType;
    if (district) filter["location.district"] = district;
    if (state) filter["location.state"] = state;

    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    const emergencyCases = await EmergencyCase.find(filter)
      .select("-media -reports")
      .sort({ dateTime: -1 });

    // Log the export action
    await AuditLog.create({
      action: "EXPORT_DATA",
      entityType: "EmergencyCase",
      entityId: null,
      performedBy: req.organizationId || req.adminId,
      performedByModel: req.organizationId ? "Organization" : "Admin",
      details: { format, filter },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    if (format === "csv") {
      // Convert to CSV format
      const csvData = convertToCSV(emergencyCases);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=emergency_cases.csv"
      );
      res.send(csvData);
    } else {
      res.status(200).json({
        success: true,
        data: emergencyCases,
        exportedAt: new Date(),
        totalRecords: emergencyCases.length,
      });
    }
  } catch (error) {
    console.error("Error exporting emergency cases:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (data.length === 0) return "";

  const headers = [
    "Case ID",
    "Title",
    "Description",
    "Incident Type",
    "Severity",
    "District",
    "State",
    "Date Time",
    "Injured",
    "Deceased",
    "Evacuated",
    "Status",
    "Verified",
    "Public",
  ];

  const rows = data.map((case_) => [
    case_.caseId,
    case_.title,
    case_.description,
    case_.incidentType,
    case_.severity,
    case_.location.district,
    case_.location.state,
    case_.dateTime.toISOString(),
    case_.affectedPeople.injured,
    case_.affectedPeople.deceased,
    case_.affectedPeople.evacuated,
    case_.status,
    case_.verificationStatus.isVerified,
    case_.isPublic,
  ]);

  return [headers, ...rows]
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
};
