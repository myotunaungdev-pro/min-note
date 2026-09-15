import mongoose from 'mongoose';

// A predefined list of allowable categories to ensure consistency across the application
export const ALLOWED_TAGS = [
    'Work',
    'Personal',
    'Shopping',
    'Health',
    'Ideas',
    'Finance',
    'Lyrics',
    'Cooking',
];

// Schema defining the core structure of a user's note
const noteSchema = new mongoose.Schema({
    // Hard link tying the note to the specific user who created it
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // The main heading of the note
    title: {
        type: String,
        required: true,
        trim: true
    },
    
    // Pro Feature: Allows users to customize the font style of the title
    titleFontFamily: {
        type: String,
        default: ''
    },
    
    // The main body text of the note
    content: {
        type: String,
        default: ''
    },
    
    // Categorization tag assigned to the note, validated against the predefined list
    tag: {
        type: String,
        default: 'Work',
        validate: {
            validator(value) {
                // Allow empty tags, otherwise ensure it matches one of the allowed options
                return value === '' || ALLOWED_TAGS.includes(value);
            },
            message: '{VALUE} is not a supported tag',
        },
    },
    
    // Visual identifier color associated with the selected tag
    tagColor: {
        type: String,
        default: '#ffffff'
    },
    
    // Boolean flag indicating if a task-oriented note has been completed
    isDone: {
        type: Boolean,
        default: false
    },
    
    // Boolean flag moving the note out of the active view without deleting it
    isArchived: {
        type: Boolean,
        default: false
    },
    
    // Soft-delete mechanism: moves to 'Trash' rather than permanently removing from the DB
    isDeleted: {
        type: Boolean,
        default: false
    },
    
    // Visual background theme applied to the note card (e.g., solid color, pattern, gradient)
    theme: {
        type: String,
        default: 'default'
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' fields for sorting and tracking
    timestamps: true
});

// Compile the schema into a queryable Mongoose model
const Note = mongoose.model('Note', noteSchema);
export default Note;