// models/ResourceRequest.js
import mongoose from "mongoose";

const resourceRequestSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
        trim: true
    },
    urgencyLevel: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium'
    },
    emergencyType: {
        type: String,
        enum: ['fire', 'medical', 'accident', 'natural_disaster', 'crime', 'search_rescue', 'hazmat', 'other'],
        required: true
    }, // Fixed: Added missing closing brace and comma
    organizationType: {
        type: String,
        enum: ['hospital', 'fire_department', 'police_station', 'ambulance_service', 'ngo', 'disaster_relief', 'emergency_service', 'government_agency', 'military', 'other'],
        required: true
    },
    contactPerson: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    location: {
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
    resourceType: {
        type: String,
        enum: [
            // Medical
            'blood', 'medical_supplies', 'medicine', 'oxygen', 'medical_equipment',
            // Fire & Rescue
            'firefighting_equipment', 'rescue_tools', 'protective_gear', 'water_supply',
            // Police & Security
            'security_equipment', 'communication_devices', 'vehicles',
            // General Emergency
            'food', 'water', 'clothing', 'blankets', 'shelter_materials',
            // Personnel
            'volunteers', 'medical_staff', 'technical_experts', 'translators',
            // Transportation
            'ambulances', 'fire_trucks', 'transport_vehicles', 'fuel',
            // Other
            'generators', 'batteries', 'lighting_equipment', 'other'
        ],
        required: true
    },
    resourceDetails: {
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            required: true // e.g., "units", "liters", "kg", "pieces"
        },
        // For blood requests
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: function() { return this.resourceType === 'blood'; }
        }
    },
    category: {
        type: String,
        enum: ['fire_emergency', 'medical_emergency', 'natural_disaster', 'accident', 'security_incident', 'search_rescue', 'community_aid', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    requiredBy: {
        type: Date,
        required: true
    },
    additionalNotes: {
        type: String,
        maxlength: 500
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: String // Admin name who verified
    },
    smsNotificationSent: {
        type: Boolean,
        default: false
    },
    notificationSentAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
resourceRequestSchema.index({ resourceType: 1, status: 1, location: 1 });

const ResourceRequest = mongoose.model("ResourceRequest", resourceRequestSchema);
export default ResourceRequest;
