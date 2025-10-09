// routes/donationRoutes.js
import express from 'express';
import Donation from '../model/Donation.js';
import ResourceRequest from '../model/ResourceRequest.js';
import { 
    createPaymentIntent, 
    updateDonationStatus,
    deleteDonation 
} from '../controllers/donationController.js';

const router = express.Router();

// Stripe - Create Payment Intent (Fundraiser Donations)
router.post('/create-payment-intent', createPaymentIntent);

// ===================== GET all donations =====================
router.get('/', async (req, res) => {
    try {
        const { status, district, resourceRequest } = req.query;
        const filter = {};

        if (status) filter.status = status.toLowerCase();
        if (district) filter['donor.district'] = district;
        if (resourceRequest) filter.resourceRequest = resourceRequest;

        const donations = await Donation.find(filter)
            .populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: donations.length, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ===================== GET single donation =====================
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser');
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
        res.json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// ===================== POST create donation =====================
router.post('/', async (req, res) => {
    try {
        const resourceRequest = await ResourceRequest.findById(req.body.resourceRequest);
        if (!resourceRequest) return res.status(404).json({ success: false, message: 'Resource request not found' });

        if (['completed', 'cancelled'].includes(resourceRequest.status)) {
            return res.status(400).json({ success: false, message: 'Resource request is not active' });
        }

        // Prevent duplicate donations (same NIC for same request)
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
        await donation.populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser');

        res.status(201).json({ success: true, message: 'Donation created successfully', data: donation });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
    }
});

// ===================== PUT update donation =====================
router.put('/:id', async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser');

        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

        res.json({ success: true, message: 'Donation updated successfully', data: donation });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Update Error', error: error.message });
    }
});

// ===================== PUT update donation STATUS - WITH FUNDRAISER REVERSAL =====================
router.put('/:id/status', updateDonationStatus);

// ===================== DELETE donation - WITH FUNDRAISER REVERSAL =====================
router.delete('/:id', deleteDonation);

export default router;