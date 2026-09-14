import { noteService } from '../services/noteService.js';

export const getNotes = async (req, res) => {
    try {
        const result = await noteService.getNotes(req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notes", error: err.message });
    }
};

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

export const bulkArchiveNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkArchiveNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const bulkTrashNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkTrashNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const bulkRestoreNotes = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await noteService.bulkRestoreNotes(ids, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};