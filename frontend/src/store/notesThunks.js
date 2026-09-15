import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosConfig';

// Fetch all notes
// Retrieves the entire list of notes for the authenticated user to populate the dashboard
export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
    const response = await axiosInstance.get(`/notes`);
    return response.data;
});

// Create a new note
// Submits a new text or image note to the server and returns the newly minted MongoDB _id
export const addNoteToServer = createAsyncThunk('notes/addNote', async (newNote) => {
    const response = await axiosInstance.post(`/notes`, newNote);
    return { ...newNote, _id: response.data.id };
});

// Update an existing note
// Pushes modifications (e.g., edited content, changed theme/tags) to the backend
export const updateNoteOnServer = createAsyncThunk('notes/updateNote', async (updatedNote) => {
    const response = await axiosInstance.put(`/notes/${updatedNote._id}`, updatedNote);
    return response.data.updatedNote;
});

// Permanently delete a note
// Immediately destroys the note record in the database (bypasses trash)
export const permanentlyDeleteFromServer = createAsyncThunk('notes/deleteNote', async (id) => {
    await axiosInstance.delete(`/notes/${id}`);
    return id; // Return the ID so the reducer can filter it out of the local array
});

// Bulk Archive
// Takes an array of selected note IDs and marks them all as archived on the server
export const bulkArchiveOnServer = createAsyncThunk(
    'notes/bulkArchiveOnServer',
    async (ids, { rejectWithValue }) => {
        try {
            await axiosInstance.patch(`/notes/bulk-archive`, { ids });
            return { ids, timestamp: new Date().toISOString() };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Bulk Trash
// Takes an array of selected note IDs and moves them to the trash (soft delete)
export const bulkTrashOnServer = createAsyncThunk(
    'notes/bulkTrashOnServer',
    async (ids, { rejectWithValue }) => {
        try {
            await axiosInstance.patch(`/notes/bulk-trash`, { ids });
            return { ids, timestamp: new Date().toISOString() };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Bulk Restore
// Takes an array of selected note IDs and reverts both archived and trashed statuses
export const bulkRestoreOnServer = createAsyncThunk(
    'notes/bulkRestoreOnServer',
    async (ids, { rejectWithValue }) => {
        try {
            await axiosInstance.patch(`/notes/bulk-restore`, { ids });
            return { ids, timestamp: new Date().toISOString() };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);