import { createSlice } from '@reduxjs/toolkit';
import {
    fetchNotes,
    addNoteToServer,
    updateNoteOnServer,
    permanentlyDeleteFromServer,
    bulkArchiveOnServer,
    bulkTrashOnServer,
    bulkRestoreOnServer,
} from './notesThunks';

// Centralized state container for the Notes application
const notesSlice = createSlice({
    name: 'notes',
    initialState: {
        notes: [], // Array of all note objects fetched from the server
        status: 'idle', // Loading state ('idle', 'loading', 'succeeded', 'failed')
        activeView: 'all', // Controls the current tab ('all', 'archived', 'trash')
        searchQuery: '', // Text used to filter notes locally
        sortBy: 'latest', // Sort order for the main view
        statusFilter: 'all', // Unused or reserved for future 'pinned/unpinned' filters
        sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth <= 904 : false, // Responsive sidebar default
        editingNote: null, // Note currently loaded in the write/edit modal
        isModalOpen: false, // Toggles the write/edit modal visibility
        readingNote: null, // Note currently loaded in the read-only modal
        selectedNoteIds: [], // Array of note IDs selected for bulk actions
        categoryFilter: [], // Tags selected for local filtering
        isShortcutModalOpen: false // Toggles the keyboard shortcuts reference modal
    },
    reducers: {
        setActiveView: (state, action) => { state.activeView = action.payload; },
        setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
        setSortBy: (state, action) => { state.sortBy = action.payload; },
        setStatusFilter: (state, action) => { state.statusFilter = action.payload; },
        
        // Adds or removes a tag from the local filter list, or clears it if 'All' is selected
        toggleCategoryFilter: (state, action) => {
            const category = action.payload;
            if (!Array.isArray(state.categoryFilter)) {
                state.categoryFilter = [];
            }
            if (category === 'All') {
                state.categoryFilter = [];
            } else {
                const index = state.categoryFilter.findIndex(c => c === category);
                if (index !== -1) {
                    state.categoryFilter.splice(index, 1);
                } else {
                    state.categoryFilter.push(category);
                }
            }
        },
        toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
        setEditingNote: (state, action) => { state.editingNote = action.payload; },
        setModalOpen: (state, action) => { state.isModalOpen = action.payload; },
        setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload; },
        setReadingNote: (state, action) => { state.readingNote = action.payload; },
        setReaderOpen: (state, action) => { state.isReaderOpen = action.payload; },
        setShortcutModalOpen: (state, action) => { state.isShortcutModalOpen = action.payload; },
        
        // Toggles a single note's selection state for bulk actions
        toggleSelectNote: (state, action) => {
            if (state.selectedNoteIds.includes(action.payload)) {
                state.selectedNoteIds = state.selectedNoteIds.filter(id => id !== action.payload);
            } else {
                state.selectedNoteIds.push(action.payload);
            }
        },
        clearSelection: (state) => { state.selectedNoteIds = []; },
        selectAllNotes: (state, action) => {
            state.selectedNoteIds = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Hydrates the store with the full list of notes on app load
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.notes = action.payload;
                state.status = 'succeeded';
            })
            // Inserts a newly created note at the top of the list locally
            .addCase(addNoteToServer.fulfilled, (state, action) => {
                state.notes.unshift(action.payload);
            })
            // Finds and replaces the updated note in the local array
            .addCase(updateNoteOnServer.fulfilled, (state, action) => {
                const index = state.notes.findIndex((n) => n._id === action.payload._id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
            })
            // Removes a permanently deleted note from the local array
            .addCase(permanentlyDeleteFromServer.fulfilled, (state, action) => {
                state.notes = state.notes.filter((n) => n._id !== action.payload);
            })
            // Optimistically updates the `isArchived` flag for all selected notes and clears selection
            .addCase(bulkArchiveOnServer.fulfilled, (state, action) => {
                const { ids, timestamp } = action.payload;
                state.notes = state.notes.map((n) =>
                    ids.includes(n._id) ? { ...n, isArchived: true, isDeleted: false, updatedAt: timestamp } : n
                );
                state.selectedNoteIds = [];
            })
            // Optimistically updates the `isDeleted` flag (Trash) for all selected notes and clears selection
            .addCase(bulkTrashOnServer.fulfilled, (state, action) => {
                const { ids, timestamp } = action.payload;
                state.notes = state.notes.map((n) =>
                    ids.includes(n._id) ? { ...n, isDeleted: true, isArchived: false, updatedAt: timestamp } : n
                );
                state.selectedNoteIds = [];
            })
            // Un-archives and un-trashes all selected notes and clears selection
            .addCase(bulkRestoreOnServer.fulfilled, (state, action) => {
                const { ids, timestamp } = action.payload;
                state.notes = state.notes.map((n) =>
                    ids.includes(n._id) ? { ...n, isArchived: false, isDeleted: false, updatedAt: timestamp } : n
                );
                state.selectedNoteIds = [];
            });
    },
});

export const {
    setActiveView,
    setSearchQuery,
    setSortBy,
    setStatusFilter,
    toggleCategoryFilter,
    toggleSidebar,
    setEditingNote,
    setModalOpen,
    setSidebarCollapsed,
    setReadingNote,
    setReaderOpen,
    setShortcutModalOpen,
    toggleSelectNote,
    clearSelection,
    selectAllNotes
} = notesSlice.actions;

export default notesSlice.reducer;