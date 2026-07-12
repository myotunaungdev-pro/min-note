import React, { useEffect } from 'react';
import './PremiumFeatureModal.css';

const PremiumFeatureModal = ({ isOpen, onClose, title, description, icon = "bi-stars", buttonText }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="premium-modal-overlay" onClick={onClose}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-icon" onClick={onClose} aria-label={buttonText || "Close"}>
                    <i className="bi bi-x-lg"></i>
                </button>
                <div className="premium-modal-icon">
                    <i className={`bi ${icon}`}></i>
                </div>
                <h3 className="premium-modal-title">{title}</h3>
                <p className="premium-modal-desc">{description}</p>
                <div className="premium-modal-actions">
                    <button className="btn-premium-close" onClick={onClose}>
                        {buttonText || "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumFeatureModal;
