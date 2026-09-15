import dns from 'node:dns/promises';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/route.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/database.js';
import { startCronJobs } from './utils/cronJobs.js';
import { checkEnvVariables } from './config/envCheck.js';

// Force Node to use Google and Cloudflare DNS to bypass certain regional ISP blocking issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load environment variables from the .env file into process.env
dotenv.config();

// Ensure all critical environment variables are present before booting the app
checkEnvVariables();

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 8000;

// Security: Restrict cross-origin requests to only the authorized frontend client URL
const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true // Allow cookies/authorization headers to be sent with requests
}));

// Stripe Webhook needs the raw, unparsed request body to verify cryptographic signatures
// Therefore, this route MUST be mounted before the global express.json() parser
import { webhookHandler } from './controllers/stripeController.js';
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Global Body Parsers: Configure limits to 50mb to allow for base64 image uploads (e.g. payment slips)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Mount all modular API routes
import stripeRoutes from './routes/stripeRoutes.js';
app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', router); // Main application routes (Notes, User, Admin, Payments)

// Basic health check endpoint to verify the server is live
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler: Catches any unhandled exceptions thrown in routes/controllers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// Main bootstrap function to securely sequence the application startup
const startServer = async () => {
    try {
        // Step A: Connect to MongoDB first
        await connectDB();
        console.log('Database connected successfully');

        // Step B: Initialize background worker tasks (e.g., auto-downgrades, reminder emails)
        startCronJobs();

        // Step C: Finally, open the port to accept incoming HTTP traffic
        app.listen(PORT, () => {
            console.log(`Backend API running on port ${PORT}`);
        });
    } catch (error) {
        // If anything fails during boot (like DB connection), crash safely
        console.error('Failed to start the server:', error.message);
        process.exit(1);
    }
};

// Execute the bootstrap sequence
startServer();