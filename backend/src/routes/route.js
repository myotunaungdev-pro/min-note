import express from 'express';
import {
    getNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    bulkArchiveNotes,
    bulkTrashNotes,
    bulkRestoreNotes
} from '../controllers/notesController.js';
import { upload, submitKPayPayment, cancelSubscription, resumeSubscription } from '../controllers/paymentController.js';
import { getManualPayments, approvePayment, rejectPayment } from '../controllers/adminController.js';
import { protect, admin, requirePro } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all note routes to ensure only logged-in users can access them
router.use('/notes', protect);

// Retrieve all notes for the user's dashboard view
router.get('/notes', getNotes);

// Create a new text or image note
router.post('/notes', createNote);

// Endpoints for managing multiple notes simultaneously (e.g., from a shift-click selection in the UI)
router.patch('/notes/bulk-archive', bulkArchiveNotes);
router.patch('/notes/bulk-trash', bulkTrashNotes);
router.patch('/notes/bulk-restore', bulkRestoreNotes);

// Fetch the specific contents of a single note for editing
router.get('/notes/:id', getNoteById);

// Save edits made to an existing note
router.put('/notes/:id', updateNote);

// Permanently delete a note, bypassing the trash bin
router.delete('/notes/:id', deleteNote);

// Handles the multipart form data upload of a KPay screenshot via Cloudinary middleware
router.post('/kpay-submit', protect, upload.single('slip'), submitKPayPayment);

// Allows users to turn auto-renew on or off for their manual offline subscriptions
router.post('/cancel-subscription', protect, cancelSubscription);
router.post('/resume-subscription', protect, resumeSubscription);

// Admin-only dashboard routes for reviewing and verifying manual payment slips
router.get('/admin/manual-payments', protect, admin, getManualPayments);
router.patch('/admin/manual-payments/:id/approve', protect, admin, approvePayment);
router.patch('/admin/manual-payments/:id/reject', protect, admin, rejectPayment);

export default router;