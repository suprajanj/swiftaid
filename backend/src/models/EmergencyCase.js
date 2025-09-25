import mongoose from "mongoose";

const emergencyCaseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    incidentType: {
      type: String,
      required: true,
      enum: [
        "Accident",
        "Natural Disaster",
        "Fire",
        "Flood",
        "Medical Emergency",
        "Security Incident",
        "Other",
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    dateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    affectedPeople: {
      injured: {
        type: Number,
        default: 0,
        min: 0,
      },
      deceased: {
        type: Number,
        default: 0,
        min: 0,
      },
      evacuated: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: [
        "Reported",
        "Under Investigation",
        "Verified",
        "Resolved",
        "Closed",
      ],
      default: "Reported",
    },
    verificationStatus: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      verificationNotes: String,
    },
    assignedAgencies: [
      {
        agency: {
          type: String,
          required: true,
          trim: true,
        },
        contactPerson: String,
        phone: String,
        status: {
          type: String,
          enum: ["Assigned", "Responding", "Completed", "Unable to Respond"],
          default: "Assigned",
        },
      },
    ],
    media: [
      {
        type: {
          type: String,
          enum: ["Photo", "Video", "Document", "Audio"],
        },
        url: String,
        description: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reports: [
      {
        reportType: {
          type: String,
          enum: ["Support Request", "Data Flag", "Update Request", "Follow-up"],
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        submittedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["Pending", "Under Review", "Approved", "Rejected"],
          default: "Pending",
        },
        adminResponse: String,
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
        },
        respondedAt: Date,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
emergencyCaseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate case ID before saving
emergencyCaseSchema.pre("save", function (next) {
  if (!this.caseId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.caseId = `EC${timestamp}${random}`;
  }
  next();
});

// Index for efficient queries
emergencyCaseSchema.index({ caseId: 1 });
emergencyCaseSchema.index({ incidentType: 1 });
emergencyCaseSchema.index({ "location.district": 1 });
emergencyCaseSchema.index({ "location.state": 1 });
emergencyCaseSchema.index({ dateTime: -1 });
emergencyCaseSchema.index({ status: 1 });
emergencyCaseSchema.index({ "verificationStatus.isVerified": 1 });
emergencyCaseSchema.index({ isPublic: 1 });

const EmergencyCase = mongoose.model("EmergencyCase", emergencyCaseSchema);

export default EmergencyCase;
