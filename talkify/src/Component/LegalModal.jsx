import React from 'react';
import "./LegalModal.css";

const LegalModal = ({ type, isOpen, onClose, onAccept, showActions = true }) => {
    if (!isOpen) return null;

    const content = {
        terms: {
            title: "Terms & Conditions",
            body: (
                <>
                    <p>Welcome to <strong>Talkify</strong>. By creating an account, you agree to the following:</p>
                    <h5>1. User Conduct</h5>
                    <p>You agree not to use Talkify for any illegal activities, harassment, or spreading of malicious content.</p>
                    <h5>2. Account Security</h5>
                    <p>You are responsible for maintaining the confidentiality of your password and account details.</p>
                    <h5>3. Service Availability</h5>
                    <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or terminate features.</p>
                </>
            )
        },
        privacy: {
            title: "Privacy Policy",
            body: (
                <>
                    <p>Your privacy is our priority. Here is how we handle your data:</p>
                    <h5>1. Data Collection</h5>
                    <p>We collect your email, name, and profile information to provide a personalized chat experience.</p>
                    <h5>2. Cookies</h5>
                    <p>Talkify uses "Cookies" to keep you logged in and remember your theme preferences (Dark/Light mode).</p>
                    <h5>3. Data Sharing</h5>
                    <p>We never sell your data to third parties. Your conversations are encrypted and private.</p>
                </>
            )
        }
    };

    const current = content[type];

    return (
        <div className="legal-overlay">
            <div className="legal-card animate-in-up">
                <div className="legal-header">
                    <h3>{current.title}</h3>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>

                <div className="legal-body">
                    {current.body}
                </div>

                {showActions ? (
                    <div className="legal-footer">
                        <button className="deny-btn" onClick={onClose}>Deny</button>
                        <button className="accept-btn" onClick={() => { onAccept(); onClose(); }}>Accept & Continue</button>
                    </div>
                ) : (
                    <div className="legal-footer">
                        <button className="accept-btn" onClick={onClose}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegalModal;