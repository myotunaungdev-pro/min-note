import { configureStore } from '@reduxjs/toolkit';
import notesReducer from './notesSlice';
import authReducer from './authSlice';

// Configures the global Redux store, combining the authentication and notes reducers
export const store = configureStore({
    reducer: {
        notes: notesReducer,
        auth: authReducer,
    },
});

export default store;