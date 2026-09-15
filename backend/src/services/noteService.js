import Note from '../models/notes.js';
import User from '../models/user.js';

class NoteService {
    // Fetches all notes belonging to a specific user, sorted by newest first
    async getNotes(userId) {
        return await Note.find({ userId }).sort({ createdAt: -1 });
    }

    // Fetches a single specific note, ensuring it actually belongs to the requesting user
    async getNoteById(noteId, userId) {
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            const err = new Error("Note not found");
            err.statusCode = 404;
            throw err;
        }
        return note;
    }

    // Handles the creation of a new note, enforcing plan limits for free tier users
    async createNote(userId, noteData) {
        const user = await User.findById(userId);
        
        // Block creation if the user is not Pro (or their Pro has expired) and they hit the 50 note limit
        if (!user || user.plan !== 'pro' || (user.plan === 'pro' && user.currentPeriodEnd && new Date(user.currentPeriodEnd) < new Date())) {
            const noteCount = await Note.countDocuments({ userId });
            if (noteCount >= 50) {
                const err = new Error("Free plan limit reached (50 notes). Please upgrade to Pro to create unlimited notes.");
                err.statusCode = 403;
                throw err;
            }
        }

        const newNote = new Note({
            ...noteData,
            userId
        });
        const savedNote = await newNote.save();
        return { message: "Note created", id: savedNote._id };
    }

    // Handles partial or full updates to an existing note, validating against the schema
    async updateNote(noteId, userId, updateData) {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId },
            { $set: updateData },
            { returnDocument: 'after', runValidators: true } // Returns the modified document, not the old one
        );

        if (!updatedNote) {
            const err = new Error("Note not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }

        return { message: "Update successful", updatedNote };
    }

    // Permanently deletes a note from the database (bypassing the trash bin)
    async deleteNote(noteId, userId) {
        const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });
        if (!deletedNote) {
            const err = new Error("Note not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }
        return { message: "Deleted successful" };
    }

    // Batch operation: Moves multiple selected notes to the Archive tab
    async bulkArchiveNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isArchived: true, isDeleted: false, updatedAt: new Date() } }
        );
        return { message: "Successfully archived selected notes" };
    }

    // Batch operation: Soft-deletes multiple selected notes, moving them to the Trash tab
    async bulkTrashNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isDeleted: true, isArchived: false, updatedAt: new Date() } }
        );
        return { message: "Successfully trashed selected notes" };
    }

    // Batch operation: Restores multiple selected notes from Archive or Trash back to the main view
    async bulkRestoreNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isArchived: false, isDeleted: false, updatedAt: new Date() } }
        );
        return { message: "Successfully restored selected notes" };
    }
}

export const noteService = new NoteService();
