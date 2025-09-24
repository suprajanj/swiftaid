// controllers/donationController.js
import Donation from '../model/Donation.js';
import ResourceRequest from '../model/ResourceRequest.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE - Add new donation (includes fundraiser with Stripe Checkout)
export const createDonation = async (req, res) => {
    try {
        const { resourceRequest, donor, donationDetails, paymentAmount } = req.body;

        // Verify resource request exists
        const request = await ResourceRequest.findById(resourceRequest);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Resource request not found' });
        }
        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({ success: false, message: 'This resource request is no longer active' });
        }

        // If fundraiser → Create Stripe Checkout session
        if (request.resourceType === 'fundraiser') {
            if (!paymentAmount || paymentAmount <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid payment amount' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'rs',
                            product_data: {
                                name: `${request.organizationName} - Fundraiser`
                            },
                            unit_amount: paymentAmount * 100 // cents
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`
            });

            // Store donation with status "pending_payment"
            const donation = new Donation({
                resourceRequest,
                donor,
                donationDetails,
                status: 'pending_payment',
                paymentSessionId: session.id,
                paymentAmount
            });
            await donation.save();

            return res.status(201).json({
                success: true,
                message: 'Stripe session created',
                sessionUrl: session.url,
                data: donation
            });
        }

        // Regular (non-fundraiser) donations
        const donation = new Donation(req.body);
        await donation.save();

        res.status(201).json({
            success: true,
            message: 'Donation submitted successfully',
            data: donation
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error submitting donation', error: error.message });
    }
};

// STRIPE PaymentIntent (for card form via Stripe Elements)
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid payment amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // cents
            currency: "rs",
            automatic_payment_methods: { enabled: true },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ success: false, message: "Payment Intent creation failed", error: error.message });
    }
};

// STRIPE Webhook - confirm fundraiser payment
export const handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Find donation by session id
            const donation = await Donation.findOne({ paymentSessionId: session.id }).populate('resourceRequest');
            if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

            // Mark donation as completed
            donation.status = 'completed';
            donation.paymentStatus = 'paid';
            await donation.save();

            // Update fundraiser collectedAmount
            if (donation.resourceRequest?.resourceType === 'fundraiser') {
                await ResourceRequest.findByIdAndUpdate(
                    donation.resourceRequest._id,
                    { $inc: { "fundraiser.collectedAmount": donation.paymentAmount } }
                );
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).send(`Webhook error: ${error.message}`);
    }
};

// GET all donations
export const getAllDonations = async (req, res) => {
    try {
        const { status, resourceRequestId, district, bloodGroup, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (resourceRequestId) filter.resourceRequest = resourceRequestId;
        if (district) filter['donor.district'] = district;
        if (bloodGroup) filter['donationDetails.bloodGroup'] = bloodGroup;

        const skip = (page - 1) * limit;
        const donations = await Donation.find(filter)
            .populate('resourceRequest', 'organizationName resourceType resourceDetails urgencyLevel fundraiser')
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
        res.status(500).json({ success: false, message: 'Error fetching donations', error: error.message });
    }
};

// GET single donation
export const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('resourceRequest');
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
        res.status(200).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching donation', error: error.message });
    }
};

// UPDATE donation status - WITH FUNDRAISER REVERSAL LOGIC
// UPDATE donation status - WITH FUNDRAISER REVERSAL LOGIC
export const updateDonationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, rejectionReason } = req.body;

        // Get the current donation with populated resource request
        const currentDonation = await Donation.findById(id).populate('resourceRequest');
        if (!currentDonation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }

        let fundraiserAdjustment = 0;

        // ✅ Case 1: Approving/Completing donation → ADD to collected
        if (
            currentDonation.resourceRequest?.resourceType === 'fundraiser' &&
            ['approved', 'completed'].includes(status) &&
            currentDonation.donationDetails?.amount > 0 &&
            !['approved', 'completed'].includes(currentDonation.status) // avoid double adding
        ) {
            fundraiserAdjustment = currentDonation.donationDetails.amount;
        }

        // ✅ Case 2: Cancelling/Rejecting donation → SUBTRACT from collected (only if already counted before)
        if (
            currentDonation.resourceRequest?.resourceType === 'fundraiser' &&
            ['cancelled', 'rejected'].includes(status) &&
            currentDonation.donationDetails?.amount > 0 &&
            ['approved', 'completed'].includes(currentDonation.status) // only reverse if it was already added
        ) {
            fundraiserAdjustment = -currentDonation.donationDetails.amount;
        }

        // Apply fundraiser adjustment if needed
        if (fundraiserAdjustment !== 0) {
            await ResourceRequest.findByIdAndUpdate(
                currentDonation.resourceRequest._id,
                { $inc: { 'fundraiser.collectedAmount': fundraiserAdjustment } }
            );

            // Ensure collectedAmount never goes below 0
            const updatedRequest = await ResourceRequest.findById(currentDonation.resourceRequest._id);
            if (updatedRequest.fundraiser.collectedAmount < 0) {
                await ResourceRequest.findByIdAndUpdate(
                    currentDonation.resourceRequest._id,
                    { 'fundraiser.collectedAmount': 0 }
                );
            }
        }

        // Update the donation status
        const updateData = { status };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === 'rejected' && rejectionReason) updateData.rejectionReason = rejectionReason;
        if (status === 'contacted') updateData.contactedAt = new Date();
        if (status === 'completed') updateData.completedAt = new Date();

        const updatedDonation = await Donation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser');

        res.json({
            success: true,
            message: `Donation status updated to ${status}${fundraiserAdjustment !== 0 ? '. Fundraiser amount adjusted.' : ''}`,
            data: updatedDonation
        });

    } catch (error) {
        console.error('Error updating donation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update donation status',
            error: error.message
        });
    }
};



// DELETE donation - WITH FUNDRAISER REVERSAL
export const deleteDonation = async (req, res) => {
    try {
        // Get donation with resource request details before deletion
        const donation = await Donation.findById(req.params.id).populate('resourceRequest');
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

        // Check if this is a completed fundraiser donation that needs amount reversal
        const needsFundraiserReversal = 
            donation.resourceRequest?.resourceType === 'fundraiser' &&
            ['completed', 'approved'].includes(donation.status) &&
            donation.donationDetails?.amount > 0;

        if (needsFundraiserReversal) {
            console.log('Reversing fundraiser amount on deletion:', donation.donationDetails.amount);
            
            // Subtract the donation amount from collected amount
            await ResourceRequest.findByIdAndUpdate(
                donation.resourceRequest._id,
                {
                    $inc: {
                        'fundraiser.collectedAmount': -donation.donationDetails.amount
                    }
                }
            );

            // Ensure collected amount doesn't go negative
            const updatedRequest = await ResourceRequest.findById(donation.resourceRequest._id);
            if (updatedRequest.fundraiser.collectedAmount < 0) {
                await ResourceRequest.findByIdAndUpdate(
                    donation.resourceRequest._id,
                    {
                        'fundraiser.collectedAmount': 0
                    }
                );
            }
        }

        // Now delete the donation
        await Donation.findByIdAndDelete(req.params.id);

        res.status(200).json({ 
            success: true, 
            message: `Donation deleted successfully${needsFundraiserReversal ? '. Fundraiser amount adjusted.' : ''}` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting donation', error: error.message });
    }
};