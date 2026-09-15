import { adminService } from '../services/adminService.js';

// GET /api/admin/manual-payments
// Retrieves the unified list of pending and processed KPay manual payment submissions
export const getManualPayments = async (req, res) => {
    try {
        const result = await adminService.getManualPayments();
        res.json(result);
    } catch (error) {
        console.error('Fetch manual payments error:', error);
        res.status(500).json({ error: 'Failed to fetch manual payments' });
    }
};

// PATCH /api/admin/manual-payments/:id/approve
// Approves a user's uploaded payment slip and provisions their premium access
export const approvePayment = async (req, res) => {
    try {
        const result = await adminService.approvePayment(req.params.id);
        res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
};

// PATCH /api/admin/manual-payments/:id/reject
// Rejects a fraudulent or unreadable payment slip, requiring the user to re-upload
export const rejectPayment = async (req, res) => {
    try {
        // Extract the optional explanation text provided by the admin in the dashboard UI
        const { rejectionReason } = req.body;
        
        // Pass the admin's ID to keep an audit log of who rejected what
        const result = await adminService.rejectPayment(req.params.id, req.user.id || req.user._id, rejectionReason);
        res.json(result);
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Reject payment error:', error);
        res.status(500).json({ error: 'Failed to reject payment' });
    }
};
