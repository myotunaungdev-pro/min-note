import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Toast.css';

// Global UI component for displaying quick, temporary notification banners (e.g., success/error messages)
const Toast = ({ isOpen, message }) => {
    if (!isOpen) return null;

    return (
        <div className={`cyber-toast ${isOpen ? 'show' : ''}`}>
            <AlertCircle size={24} className="toast-icon" />
            <span className="toast-message">{message}</span>
        </div>
    );
};

export default Toast;
