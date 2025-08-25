import express from 'express';
import resourceRoutes from './resourceRoutes.js';
import donationRoutes from './donationRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Emergency Resource Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount route modules
router.use('/resources', resourceRoutes);
router.use('/donations', donationRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
            'GET /api/health',
            'GET /api/resources/requests',
            'POST /api/resources/requests',
            'GET /api/donations/donations',
            'POST /api/donations/donations'
        ]
    });
});

export default router;