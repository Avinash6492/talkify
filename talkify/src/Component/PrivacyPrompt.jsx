import React from 'react';
import "./ChatContainer.css";

const PrivacyPrompt = ({ onAccept, onBlock }) => {
    return (
        <div className="privacy-prompt-box">
            <p>This sender is not in your contacts. Do you know them?</p>
            <div className="privacy-actions">
                <button className="privacy-btn block" onClick={onBlock}>Block</button>
                <button className="privacy-btn accept" onClick={onAccept}>Accept</button>
            </div>
        </div>
    );
};

export default PrivacyPrompt;