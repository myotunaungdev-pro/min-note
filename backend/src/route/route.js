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
} from '../controller/notesController.js';
import { upload, submitKPayPayment, cancelSubscription, resumeSubscription } from '../controller/paymentController.js';
import { getManualPayments, approvePayment, rejectPayment } from '../controller/adminController.js';
import { protect, admin, requirePro } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all note routes
router.use('/notes', protect);

// Fetch all notes
router.get('/notes', getNotes);

// Create a new note
router.post('/notes', createNote);

// 🚀 API routes for bulk actions 
router.patch('/notes/bulk-archive', bulkArchiveNotes);
router.patch('/notes/bulk-trash', bulkTrashNotes);
router.patch('/notes/bulk-restore', bulkRestoreNotes);

// Fetch a single note by ID
router.get('/notes/:id', getNoteById);

// Update an existing note by ID
router.put('/notes/:id', updateNote);

// Delete a note by ID
router.delete('/notes/:id', deleteNote);

// Submit manual KPay payment
router.post('/kpay-submit', protect, upload.single('slip'), submitKPayPayment);

// Subscription management
router.post('/cancel-subscription', protect, cancelSubscription);
router.post('/resume-subscription', protect, resumeSubscription);

// Admin Routes
router.get('/admin/manual-payments', protect, admin, getManualPayments);
router.patch('/admin/manual-payments/:id/approve', protect, admin, approvePayment);
router.patch('/admin/manual-payments/:id/reject', protect, admin, rejectPayment);

export default router;