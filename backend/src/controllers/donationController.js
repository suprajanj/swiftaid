// controllers/donationController.js
import Donation from '../model/Donation.js';
import ResourceRequest from '../model/ResourceRequest.js';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// === DEBUG: Check if env variables are loaded ===
console.log('=== EMAIL CONFIG DEBUG ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***LOADED***' : 'MISSING');
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
console.log('========================');

// Configure Nodemailer (Gmail SMTP)
// DON'T create transporter immediately - wait until env is loaded
let transporter = null;

// Create transporter function - called when needed
function getTransporter() {
    if (!transporter) {
        console.log('Creating email transporter...');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'LOADED' : 'MISSING');
        
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

// Helper: Send thank you email
export async function sendThankYouEmail(to, donorName, organizationName) {
    try {
        console.log(`Attempting to send thank you email to: ${to}`);
        
        const emailTransporter = getTransporter();
        if (!emailTransporter) {
            throw new Error('Email transporter not initialized');
        }
        
        const info = await emailTransporter.sendMail({
            from: `"SwiftAid" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Thank You for Your Donation",
            html: `
                <h2>Dear ${donorName},</h2>
                <p>We are pleased to inform you that your donation has been <b>recorded</b> successfully.</p>
                <p>Your generosity is helping <b>${organizationName}</b> achieve its goals.</p>
                <p>Thank you for your valuable contribution!</p>
                <br/>
                <p>Best regards,<br/>SwiftAid Team</p>
            `
        });
        
        console.log(`Email sent successfully!`);
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Response: ${info.response}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email:', error.message);
        console.error('Full error:', error);
        return { success: false, error: error.message };
    }
}

// CREATE - Add new donation (Stripe + normal)
export const createDonation = async (req, res) => {
    try {
        const { resourceRequest, donor, donationDetails, paymentAmount } = req.body;

        const request = await ResourceRequest.findById(resourceRequest);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Resource request not found' });
        }
        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({ success: false, message: 'This resource request is no longer active' });
        }

        if (request.resourceType === 'fundraiser') {
            if (!paymentAmount || paymentAmount <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid payment amount' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'lkr',
                            product_data: {
                                name: `${request.organizationName} - Fundraiser`
                            },
                            unit_amount: paymentAmount * 100
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`
            });

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

        const donation = new Donation(req.body);
        await donation.save();

        if (donation?.donor?.email) {
            console.log(`Sending thank you email for normal donation to: ${donation.donor.email}`);
            const emailResult = await sendThankYouEmail(
                donation.donor.email,
                donation.donor.fullName || "Donor",
                request.organizationName || "the campaign"
            );
            
            if (emailResult.success) {
                console.log('Thank you email sent successfully for new donation');
            } else {
                console.error('Failed to send thank you email for new donation:', emailResult.error);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Donation submitted successfully & email sent',
            data: donation
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(400).json({ success: false, message: 'Error submitting donation', error: error.message });
    }
};

// STRIPE PaymentIntent
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid payment amount" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "lkr",
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

// STRIPE Webhook
export const handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const donation = await Donation.findOne({ paymentSessionId: session.id }).populate('resourceRequest');
            if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

            donation.status = 'completed';
            donation.paymentStatus = 'paid';
            await donation.save();

            if (donation.resourceRequest?.resourceType === 'fundraiser') {
                await ResourceRequest.findByIdAndUpdate(
                    donation.resourceRequest._id,
                    { $inc: { "fundraiser.collectedAmount": donation.paymentAmount } }
                );
            }

            if (donation?.donor?.email) {
                console.log(`Sending thank you email for Stripe payment to: ${donation.donor.email}`);
                const emailResult = await sendThankYouEmail(
                    donation.donor.email,
                    donation.donor.fullName || "Donor",
                    donation.resourceRequest?.organizationName || "the campaign"
                );
                
                if (emailResult.success) {
                    console.log('Thank you email sent successfully after Stripe payment');
                } else {
                    console.error('Failed to send thank you email after Stripe payment:', emailResult.error);
                }
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
        console.error('Error fetching donations:', error);
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
        console.error('Error fetching donation:', error);
        res.status(500).json({ success: false, message: 'Error fetching donation', error: error.message });
    }
};

// UPDATE donation status + EMAIL
export const updateDonationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, rejectionReason } = req.body;

        console.log(`Updating donation ${id} to status: ${status}`);

        const currentDonation = await Donation.findById(id).populate('resourceRequest');
        if (!currentDonation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }

        let fundraiserAdjustment = 0;

        if (
            currentDonation.resourceRequest?.resourceType === 'fundraiser' &&
            ['approved', 'completed'].includes(status) &&
            currentDonation.donationDetails?.amount > 0 &&
            !['approved', 'completed'].includes(currentDonation.status)
        ) {
            fundraiserAdjustment = currentDonation.donationDetails.amount;
        }

        if (
            currentDonation.resourceRequest?.resourceType === 'fundraiser' &&
            ['cancelled', 'rejected'].includes(status) &&
            currentDonation.donationDetails?.amount > 0 &&
            ['approved', 'completed'].includes(currentDonation.status)
        ) {
            fundraiserAdjustment = -currentDonation.donationDetails.amount;
        }

        if (fundraiserAdjustment !== 0) {
            await ResourceRequest.findByIdAndUpdate(
                currentDonation.resourceRequest._id,
                { $inc: { 'fundraiser.collectedAmount': fundraiserAdjustment } }
            );
            const updatedRequest = await ResourceRequest.findById(currentDonation.resourceRequest._id);
            if (updatedRequest.fundraiser.collectedAmount < 0) {
                await ResourceRequest.findByIdAndUpdate(
                    currentDonation.resourceRequest._id,
                    { 'fundraiser.collectedAmount': 0 }
                );
            }
        }

        const updateData = { status };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === 'rejected' && rejectionReason) updateData.rejectionReason = rejectionReason;
        if (status === 'contacted') updateData.contactedAt = new Date();
        if (status === 'completed') updateData.completedAt = new Date();

        const updatedDonation = await Donation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('resourceRequest', 'organizationName resourceType urgencyLevel fundraiser donor');

        let emailSent = false;
        if (status === 'completed' && updatedDonation?.donor?.email) {
            console.log(`Admin marked donation as completed. Sending thank you email to: ${updatedDonation.donor.email}`);
            
            try {
                const emailResult = await sendThankYouEmail(
                    updatedDonation.donor.email,
                    updatedDonation.donor.fullName || "Donor",
                    updatedDonation.resourceRequest?.organizationName || "the campaign"
                );
                
                if (emailResult.success) {
                    console.log('Thank you email sent successfully after admin status update');
                    emailSent = true;
                } else {
                    console.error('Failed to send thank you email after admin status update:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Error sending thank you email:', emailError);
            }
        }

        res.json({
            success: true,
            message: `Donation status updated to ${status}${fundraiserAdjustment !== 0 ? '. Fundraiser amount adjusted.' : ''}${emailSent ? ' Thank you email sent to donor.' : ''}`,
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

// DELETE donation
export const deleteDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('resourceRequest');
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

        const needsFundraiserReversal =
            donation.resourceRequest?.resourceType === 'fundraiser' &&
            ['completed', 'approved'].includes(donation.status) &&
            donation.donationDetails?.amount > 0;

        if (needsFundraiserReversal) {
            await ResourceRequest.findByIdAndUpdate(
                donation.resourceRequest._id,
                { $inc: { 'fundraiser.collectedAmount': -donation.donationDetails.amount } }
            );
            const updatedRequest = await ResourceRequest.findById(donation.resourceRequest._id);
            if (updatedRequest.fundraiser.collectedAmount < 0) {
                await ResourceRequest.findByIdAndUpdate(
                    donation.resourceRequest._id,
                    { 'fundraiser.collectedAmount': 0 }
                );
            }
        }

        await Donation.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `Donation deleted successfully${needsFundraiserReversal ? '. Fundraiser amount adjusted.' : ''}`
        });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ success: false, message: 'Error deleting donation', error: error.message });
    }
};