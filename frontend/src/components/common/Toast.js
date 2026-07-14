import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Toast.css';

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
