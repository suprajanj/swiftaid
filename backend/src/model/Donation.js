// models/Donation.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    resourceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResourceRequest',
        required: true
    },
    donor: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        nic: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    donationDetails: {
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        // For blood donations
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        lastDonationDate: {
            type: Date // For blood donors
        },
        medicalConditions: {
            type: String,
            maxlength: 300
        }
    },
    availability: {
        preferredDate: {
            type: Date,
            required: true
        },
        preferredTime: {
            type: String,
            required: true // e.g., "morning", "afternoon", "evening"
        },
        isFlexible: {
            type: Boolean,
            default: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'contacted', 'completed', 'rejected', 'cancelled'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        maxlength: 500
    },
    contactedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        enum: ['fake_details', 'medical_ineligible', 'duplicate', 'no_longer_needed', 'other']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationNotes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
donationSchema.index({ resourceRequest: 1, status: 1, 'donor.district': 1 });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;