import mongoose from 'mongoose';

const manualPaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planType: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true },
    slipUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: null }
}, { timestamps: true });

const ManualPayment = mongoose.model('ManualPayment', manualPaymentSchema);
export default ManualPayment;
