import express from 'express';
import Donation from '../model/Donation.js';
import ResourceRequest from '../model/ResourceRequest.js';

const router = express.Router();

// GET all donations with filters
router.get('/donations', async (req, res) => {
    try {
        const { status, district, resourceRequest } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (district) filter['donor.district'] = district;
        if (resourceRequest) filter.resourceRequest = resourceRequest;

        const donations = await Donation.find(filter)
            .populate('resourceRequest', 'organizationName resourceType resourceDetails urgencyLevel')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// GET single donation by ID
router.get('/donations/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('resourceRequest');
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        res.json({
            success: true,
            data: donation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// POST create new donation
router.post('/donations', async (req, res) => {
    try {
        // Check if resource request exists
        const resourceRequest = await ResourceRequest.findById(req.body.resourceRequest);
        if (!resourceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Resource request not found'
            });
        }

        // Check if resource request is still active
        if (resourceRequest.status === 'completed' || resourceRequest.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Resource request is no longer active'
            });
        }

        const donation = new Donation(req.body);
        await donation.save();

        // Populate the resource request data for response
        await donation.populate('resourceRequest', 'organizationName resourceType urgencyLevel');

        res.status(201).json({
            success: true,
            message: 'Donation offer created successfully',
            data: donation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: error.message
        });
    }
});

// PUT update donation status
router.put('/donations/:id/status', async (req, res) => {
    try {
        const { status, adminNotes, rejectionReason } = req.body;
        
        const allowedStatuses = ['pending', 'approved', 'contacted', 'completed', 'rejected', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const updateData = { status };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        if (status === 'contacted') {
            updateData.contactedAt = new Date();
        }
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('resourceRequest', 'organizationName resourceType');

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        res.json({
            success: true,
            message: 'Donation status updated successfully',
            data: donation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Update Error',
            error: error.message
        });
    }
});

// DELETE donation
router.delete('/donations/:id', async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        res.json({
            success: true,
            message: 'Donation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

// GET donations for a specific resource request
router.get('/resource-requests/:requestId/donations', async (req, res) => {
    try {
        const donations = await Donation.find({
            resourceRequest: req.params.requestId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
});

export default router;