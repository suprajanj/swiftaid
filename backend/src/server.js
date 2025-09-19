import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

// Load environment variables from .env file FIRST
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',        
    'http://127.0.0.1:5175',
    'http://localhost:5176',        
    'http://127.0.0.1:5176',
],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
})); // Enable CORS for all routes
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies

// API Routes (mount all routes under /api)
app.use('/api', routes);

// Root endpoint (this should be the ONLY root route)
app.get('/', (req, res) => {
    res.json({
        message: 'SwiftAid Emergency Resource Management API',
        status: 'Running',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            resourceRequests: '/api/resources/requests',
            donations: '/api/donations/donations',
            stats: {
                resources: '/api/resources/stats',
                donations: '/api/donations/stats'
            }
        },
        documentation: `http://localhost:${process.env.PORT || 3000}/api/health`
    });
});

// 404 handler for non-API routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /api/health',
            'GET /api/resources/requests',
            'POST /api/resources/requests',
            'GET /api/donations/donations',
            'POST /api/donations/donations'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Define PORT from environment variables
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`API Documentation available at: http://localhost:${PORT}/`);
    console.log(`Emergency Resource Management System - SwiftAid`);
});