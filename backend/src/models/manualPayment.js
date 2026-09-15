import mongoose from 'mongoose';

// Schema defining the structure for offline/manual payment submissions (e.g., KPay)
const manualPaymentSchema = new mongoose.Schema({
    // Reference to the user submitting the payment
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // The specific subscription duration they are paying for
    planType: { type: String, enum: ['monthly', 'yearly'], required: true },
    
    // The total amount transferred (kept for record-keeping and admin verification)
    amount: { type: Number, required: true },
    
    // Cloudinary secure URL where the uploaded payment screenshot is stored
    slipUrl: { type: String, required: true },
    
    // Current lifecycle state of this payment submission
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    
    // If rejected, stores the code or text explaining why it was denied
    rejectionReason: { type: String, default: null },
    
    // Audit trail tracking all previous rejected attempts by this user for transparency
    rejectionHistory: [{
        slipUrl: { type: String, required: true },
        reason: { type: String, required: true },
        rejectedAt: { type: Date, default: Date.now },
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true }); // Automatically manages createdAt and updatedAt fields

const ManualPayment = mongoose.model('ManualPayment', manualPaymentSchema);
export default ManualPayment;
