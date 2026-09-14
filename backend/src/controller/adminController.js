import { adminService } from '../services/adminService.js';

// GET /api/admin/manual-payments
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
export const rejectPayment = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
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
