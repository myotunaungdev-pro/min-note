import { noteService } from '../services/noteService.js';

// GET /api/notes
// Returns all notes for the authenticated user, automatically sorted by creation date
export const getNotes = async (req, res) => {
    try {
        const result = await noteService.getNotes(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notes", error: err.message });
    }
};

// GET /api/notes/:id
// Returns a specific note, strictly validating that the requesting user actually owns it
export const getNoteById = async (req, res) => {
    try {
        const result = await noteService.getNoteById(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        res.status(500).json({ message: "Error retrieving note", error: err.message });
    }
};

// POST /api/notes
// Creates a new note, enforcing the 50-note hard limit for Free tier users
export const createNote = async (req, res) => {
    try {
        const result = await noteService.createNote(req.user.id, req.body);
        res.status(201).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        res.status(500).json({ message: "Save failed", error: err.message });
    }
};

// PUT /api/notes/:id
// Partially or fully updates a note's properties (content, theme, tags, etc.)
export const updateNote = async (req, res) => {
    try {
        const result = await noteService.updateNote(req.params.id, req.user.id, req.body);
        res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

// DELETE /api/notes/:id
// Permanently destroys a note record from the database (cannot be restored)
export const deleteNote = async (req, res) => {
    try {
        const result = await noteService.deleteNote(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};

// PATCH /api/notes/bulk/archive
// Takes an array of Note IDs and marks them all as archived simultaneously
export const bulkArchiveNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkArchiveNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// PATCH /api/notes/bulk/trash
// Takes an array of Note IDs and soft-deletes them simultaneously
export const bulkTrashNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkTrashNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// PATCH /api/notes/bulk/restore
// Un-archives and un-trashes an array of Note IDs simultaneously
export const bulkRestoreNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkRestoreNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};