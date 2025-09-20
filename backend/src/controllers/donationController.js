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
                            currency: 'usd',
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
            currency: "usd",
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

// UPDATE donation status
export const updateDonationStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const donation = await Donation.findByIdAndUpdate(req.params.id, { status, adminNotes }, { new: true });
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
        res.status(200).json({ success: true, message: 'Donation updated', data: donation });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating donation', error: error.message });
    }
};

// DELETE donation
export const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
        res.status(200).json({ success: true, message: 'Donation deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting donation', error: error.message });
    }
};
