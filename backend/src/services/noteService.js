import Note from '../model/notes.js';
import User from '../model/user.js';

class NoteService {
    async getNotes(userId) {
        return await Note.find({ userId }).sort({ createdAt: -1 });
    }

    async getNoteById(noteId, userId) {
        const note = await Note.findOne({ _id: noteId, userId });
        if (!note) {
            const err = new Error("Note not found");
            err.statusCode = 404;
            throw err;
        }
        return note;
    }

    async createNote(userId, noteData) {
        const user = await User.findById(userId);
        
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

    async updateNote(noteId, userId, updateData) {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId },
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedNote) {
            const err = new Error("Note not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }

        return { message: "Update successful", updatedNote };
    }

    async deleteNote(noteId, userId) {
        const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });
        if (!deletedNote) {
            const err = new Error("Note not found or unauthorized");
            err.statusCode = 404;
            throw err;
        }
        return { message: "Deleted successful" };
    }

    async bulkArchiveNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isArchived: true, isDeleted: false, updatedAt: new Date() } }
        );
        return { message: "Successfully archived selected notes" };
    }

    async bulkTrashNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isDeleted: true, isArchived: false, updatedAt: new Date() } }
        );
        return { message: "Successfully trashed selected notes" };
    }

    async bulkRestoreNotes(ids, userId) {
        await Note.updateMany(
            { _id: { $in: ids }, userId }, 
            { $set: { isArchived: false, isDeleted: false, updatedAt: new Date() } }
        );
        return { message: "Successfully restored selected notes" };
    }
}

export const noteService = new NoteService();
