// controllers/donationController.js
import Donation from '../models/Donation.js';
import ResourceRequest from '../models/ResourceRequest.js';

// CREATE - Add new donation (from SMS form submission)
export const createDonation = async (req, res) => {
    try {
        // Verify the resource request exists and is still active
        const resourceRequest = await ResourceRequest.findById(req.body.resourceRequest);
        
        if (!resourceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Resource request not found'
            });
        }
        
        if (resourceRequest.status === 'completed' || resourceRequest.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This resource request is no longer active'
            });
        }
        
        // Check for duplicate donations (same NIC for same request)
        const existingDonation = await Donation.findOne({
            resourceRequest: req.body.resourceRequest,
            'donor.nic': req.body.donor.nic,
            status: { $nin: ['rejected', 'cancelled'] }
        });
        
        if (existingDonation) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a donation for this request'
            });
        }
        
        const donation = new Donation(req.body);
        await donation.save();
        
        res.status(201).json({
            success: true,
            message: 'Thank you! Your donation offer has been submitted successfully',
            data: donation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error submitting donation',
            error: error.message
        });
    }
};

// READ - Get all donations with filters
export const getAllDonations = async (req, res) => {
    try {
        const { 
            status, 
            resourceRequestId, 
            district, 
            bloodGroup, 
            page = 1, 
            limit = 10 
        } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (resourceRequestId) filter.resourceRequest = resourceRequestId;
        if (district) filter['donor.district'] = district;
        if (bloodGroup) filter['donationDetails.bloodGroup'] = bloodGroup;
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        const donations = await Donation.find(filter)
            .populate('resourceRequest', 'hospitalName resourceType resourceDetails urgencyLevel')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Donation.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalDonations: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations',
            error: error.message
        });
    }
};

// READ - Get single donation by ID
export const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('resourceRequest');
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: donation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donation',
            error: error.message
        });
    }
};

// UPDATE - Update donation status and details
export const updateDonationStatus = async (req, res) => {
    try {
        const { 
            status, 
            adminNotes, 
            rejectionReason, 
            verificationNotes, 
            isVerified 
        } = req.body;
        
        const updateData = { status };
        
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (rejectionReason) updateData.rejectionReason = rejectionReason;
        if (verificationNotes) updateData.verificationNotes = verificationNotes;
        if (typeof isVerified !== 'undefined') updateData.isVerified = isVerified;
        
        // Set timestamps based on status
        if (status === 'contacted') {
            updateData.contactedAt = new Date();
        } else if (status === 'completed') {
            updateData.completedAt = new Date();
        }
        
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('resourceRequest');
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Donation updated successfully',
            data: donation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating donation',
            error: error.message
        });
    }
};

// UPDATE - Bulk update multiple donations
export const bulkUpdateDonations = async (req, res) => {
    try {
        const { donationIds, status, adminNotes } = req.body;
        
        if (!donationIds || !Array.isArray(donationIds)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid donation IDs array'
            });
        }
        
        const updateData = { status };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === 'contacted') updateData.contactedAt = new Date();
        if (status === 'completed') updateData.completedAt = new Date();
        
        const result = await Donation.updateMany(
            { _id: { $in: donationIds } },
            updateData
        );
        
        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} donations updated successfully`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating donations',
            error: error.message
        });
    }
};

// DELETE - Delete donation (for fake/spam entries)
export const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Donation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting donation',
            error: error.message
        });
    }
};

// DELETE - Bulk delete multiple donations
export const bulkDeleteDonations = async (req, res) => {
    try {
        const { donationIds, reason } = req.body;
        
        if (!donationIds || !Array.isArray(donationIds)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid donation IDs array'
            });
        }
        
        const result = await Donation.deleteMany({
            _id: { $in: donationIds }
        });
        
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} donations deleted successfully`,
            reason: reason || 'Admin action'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting donations',
            error: error.message
        });
    }
};

// GET - Dashboard statistics for donations
export const getDonationStats = async (req, res) => {
    try {
        const statusStats = await Donation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const bloodGroupStats = await Donation.aggregate([
            {
                $match: { 'donationDetails.bloodGroup': { $exists: true } }
            },
            {
                $group: {
                    _id: '$donationDetails.bloodGroup',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const districtStats = await Donation.aggregate([
            {
                $group: {
                    _id: '$donor.district',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const pendingDonations = await Donation.countDocuments({ 
            status: 'pending' 
        });
        
        const todayDonations = await Donation.countDocuments({
            createdAt: { 
                $gte: new Date(new Date().setHours(0,0,0,0)) 
            }
        });
        
        res.status(200).json({
            success: true,
            data: {
                statusStats,
                bloodGroupStats,
                districtStats,
                pendingDonations,
                todayDonations,
                totalDonations: await Donation.countDocuments()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donation statistics',
            error: error.message
        });
    }
};

// GET - Get donations for a specific resource request
export const getDonationsByResourceRequest = async (req, res) => {
    try {
        const { resourceRequestId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = { resourceRequest: resourceRequestId };
        if (status) filter.status = status;
        
        const skip = (page - 1) * limit;
        
        const donations = await Donation.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Donation.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: donations,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalDonations: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations for resource request',
            error: error.message
        });
    }
};