import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE_ORGANIZATION",
        "UPDATE_ORGANIZATION",
        "DELETE_ORGANIZATION",
        "CREATE_CASE",
        "UPDATE_CASE",
        "DELETE_CASE",
        "VERIFY_CASE",
        "EXPORT_DATA",
        "GRANT_ACCESS",
        "REVOKE_ACCESS",
        "SUBMIT_REPORT",
        "RESPOND_TO_REPORT",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Organization", "EmergencyCase", "Admin", "Report", "Access"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "performedByModel",
    },
    performedByModel: {
      type: String,
      required: true,
      enum: ["Organization", "Admin"],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
  },
  {
    timestamps: false,
  }
);

// Index for efficient queries
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ success: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
