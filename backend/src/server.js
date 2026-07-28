import dns from 'node:dns/promises';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './route/route.js';
import authRoutes from './route/authRoutes.js';
import { connectDB } from './utils/database.js';
import { startCronJobs } from './utils/cronJobs.js';

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
// Stripe Webhook needs raw body, mount before json parser
import { webhookHandler } from './controller/stripeController.js';
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Routes
import stripeRoutes from './route/stripeRoutes.js';
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', router);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// Database Connection and Server Initialization
const startServer = async () => {
    try {
        await connectDB();
        console.log('🍃 Database connected successfully');
        
        // Start background tasks
        startCronJobs();

        app.listen(PORT, () => {
            console.log(`🚀 Backend API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start the server:', error.message);
        process.exit(1);
    }
};

startServer();