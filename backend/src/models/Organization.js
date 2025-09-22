import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    organizationType: {
      type: String,
      required: true,
      enum: ["Insurance", "Media", "NGO"],
      default: "NGO",
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    accessLevel: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
    allowedRegions: [
      {
        type: String,
        trim: true,
      },
    ],
    allowedIncidentTypes: [
      {
        type: String,
        enum: [
          "Accident",
          "Natural Disaster",
          "Fire",
          "Medical Emergency",
          "Security Incident",
          "Other",
        ],
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
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
organizationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
organizationSchema.index({ email: 1 });
organizationSchema.index({ organizationType: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ allowedRegions: 1 });

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
