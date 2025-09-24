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
// Correct catch-all for Express 5
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});


export default router;