import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Fallback to local MongoDB instance if environment variable is missing
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/min-note';
        
        // Establish connection to the database
        await mongoose.connect(mongoURI);
        console.log('🍃 MongoDB Connected smoothly via Mongoose');
    } catch (error) {
        // Log the connection failure and terminate the process to prevent hanging
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};