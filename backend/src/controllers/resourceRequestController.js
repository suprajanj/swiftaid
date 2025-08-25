import ResourceRequest from '../models/ResourceRequest.js';
import Donation from '../models/Donation.js';

// CREATE - Add new resource request
export const createResourceRequest = async (req, res) => {
    try {
        const requestData = req.body;

        // Ensure resourceDetails is properly structured with defaults
        requestData.resourceDetails = requestData.resourceDetails || {};
        requestData.resourceDetails.description = requestData.resourceDetails.description || `${requestData.resourceType} needed urgently for ${requestData.emergencyType}`;
        requestData.resourceDetails.quantity = requestData.resourceDetails.quantity || 1;
        requestData.resourceDetails.unit = requestData.resourceDetails.unit || "units";
        // Explicitly clear bloodGroup if not a blood request
        if (requestData.resourceType !== 'blood') {
            requestData.resourceDetails.bloodGroup = undefined;
        } else if (!requestData.resourceDetails.bloodGroup) {
            return res.status(400).json({
                success: false,
                message: 'Blood group is required for blood requests'
            });
        }

        // Map emergencyType to category (align with schema enum)
        const categoryMap = {
            'fire': 'fire_emergency',
            'medical': 'medical_emergency',
            'accident': 'accident',
            'natural_disaster': 'natural_disaster',
            'crime': 'security_incident',
            'search_rescue': 'search_rescue',
            'hazmat': 'community_aid',
            'other': 'other'
        };
        requestData.category = categoryMap[requestData.emergencyType] || 'other';

        const resourceRequest = new ResourceRequest(requestData);
        const savedRequest = await resourceRequest.save();

        res.status(201).json({
            success: true,
            message: 'Resource request created successfully',
            data: savedRequest
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating resource request',
            error: error.message,
            validationErrors: error.errors // Include validation details for debugging
        });
    }
};

// READ - Get all active resource requests for donations
export const getActiveResourceRequests = async (req, res) => {
    try {
        const activeRequests = await ResourceRequest.find({
            status: { $in: ['pending', 'in_progress'] }
        }).select('_id organizationName resourceType urgencyLevel');

        if (!activeRequests.length) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No active resource requests available'
            });
        }

        res.status(200).json({
            success: true,
            data: activeRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active resource requests',
            error: error.message
        });
    }
};

// [Rest of the existing methods remain unchanged]