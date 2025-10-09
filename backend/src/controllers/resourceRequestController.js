import ResourceRequest from '../model/ResourceRequest.js';
import Donation from '../model/Donation.js';

// CREATE - Add new resource request
export const createResourceRequest = async (req, res) => {
    try {
        const requestData = req.body;

        // Ensure resourceDetails is properly structured with defaults
        requestData.resourceDetails = requestData.resourceDetails || {};
        requestData.resourceDetails.description =
            requestData.resourceDetails.description ||
            `${requestData.resourceType} needed urgently for ${requestData.emergencyType}`;
        requestData.resourceDetails.quantity =
            requestData.resourceDetails.quantity || 1;
        requestData.resourceDetails.unit =
            requestData.resourceDetails.unit || "units";

        // Explicitly clear bloodGroup if not a blood request
        if (requestData.resourceType !== 'blood') {
            requestData.resourceDetails.bloodGroup = undefined;
        } else if (!requestData.resourceDetails.bloodGroup) {
            return res.status(400).json({
                success: false,
                message: 'Blood group is required for blood requests'
            });
        }

        // Handle fundraiser special case
        if (requestData.resourceType === 'fundraiser') {
            if (!requestData.fundraiser || !requestData.fundraiser.targetAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'Target amount is required for fundraiser requests'
                });
            }
            requestData.fundraiser = {
                targetAmount: requestData.fundraiser.targetAmount,
                collectedAmount: 0
            };
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
            'other': 'other',
            'disaster': 'natural_disaster'
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
            validationErrors: error.errors
        });
    }
};

// READ - Get all active resource requests for donations
export const getActiveResourceRequests = async (req, res) => {
    try {
        const activeRequests = await ResourceRequest.find({
            status: { $in: ['pending', 'in_progress'] }
        }).select('_id organizationName resourceType urgencyLevel fundraiser');

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

// UPDATE fundraiser amount (when donation payment is successful)
export const updateFundraiserAmount = async (req, res) => {
    try {
        const { id } = req.params; // fundraiser resource request id
        const { collectedAmount } = req.body; // Change from 'amount' to 'collectedAmount' to match frontend

        console.log('Updating fundraiser:', id, 'with amount:', collectedAmount);

        if (!collectedAmount || collectedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid donation amount"
            });
        }

        // First, find the current request to validate
        const currentRequest = await ResourceRequest.findById(id);
        
        if (!currentRequest) {
            return res.status(404).json({
                success: false,
                message: "Fundraiser request not found"
            });
        }

        if (currentRequest.resourceType !== 'fundraiser') {
            return res.status(400).json({
                success: false,
                message: "Not a fundraiser request"
            });
        }

        // Calculate new total, ensuring it doesn't exceed target
        const currentCollected = currentRequest.fundraiser?.collectedAmount || 0;
        const newTotal = currentCollected + parseFloat(collectedAmount);
        const targetAmount = currentRequest.fundraiser.targetAmount;
        const finalAmount = Math.min(newTotal, targetAmount);

        console.log('Current collected:', currentCollected, 'New total:', newTotal, 'Final amount:', finalAmount);

        // Update the fundraiser amount
        const updatedRequest = await ResourceRequest.findByIdAndUpdate(
            id,
            { 
                'fundraiser.collectedAmount': finalAmount,
                // Update status if target is reached
                ...(finalAmount >= targetAmount && { status: 'completed' })
            },
            { new: true }
        );

        console.log('Updated request:', updatedRequest.fundraiser);

        res.status(200).json({
            success: true,
            message: "Fundraiser amount updated successfully",
            data: updatedRequest,
            newAmount: finalAmount
        });
        
    } catch (error) {
        console.error('Error updating fundraiser amount:', error);
        res.status(500).json({
            success: false,
            message: "Error updating fundraiser amount",
            error: error.message
        });
    }
};