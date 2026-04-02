import React from 'react';
import "./LogoutModal.css";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="logout-overlay">
            <div className="logout-card animate-in-up">
                <div className="logout-icon">
                    <span className="material-symbols-rounded">logout</span>
                </div>
                <h3>Log Out?</h3>
                <p>Are you sure you want to log out of <strong>Talkify</strong>? You'll need to sign back in to access your chats.</p>
                
                <div className="logout-actions">
                    <button className="cancel-btn" onClick={onClose}>
                        Stay Logged In
                    </button>
                    <button className="confirm-logout-btn" onClick={onConfirm}>
                        Yes, Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;