import React from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import "./InviteQR.css";

const InviteQR = () => {
    const navigate = useNavigate();
    
    // In a real app, this would be a dynamic link to the user's profile
    const inviteLink = "https://talkify.app/invite/user123";

    return (
        <div className='qr-page-container'>
            <div className='qr-card animate-in'>
                <div className='qr-header'>
                    <button className='qr-back-btn' onClick={() => navigate(-1)}>
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h2>My QR Code</h2>
                </div>

                <div className='qr-display-section'>
                    {/* The QR "Card" */}
                    <div className='qr-id-card'>
                        <div className='qr-user-info'>
                            <img src={assets.profile_martin} alt="profile" className='qr-avatar' />
                            <div className='qr-user-details'>
                                <h3>Martin Johnson</h3>
                                <p>@martinj_99</p>
                            </div>
                        </div>

                        <div className='qr-code-wrapper'>
                            {/* Placeholder for QR Code - You can use 'qrcode.react' library later */}
                            <img src={assets.code} alt="QR Code" className='main-qr-img' />
                            <div className='qr-logo-overlay'>
                                <img src={assets.logo_icon} alt="logo" />
                            </div>
                        </div>

                        <p className='qr-instruction'>Scan this code to add me on Talkify</p>
                    </div>
                </div>

                <div className='qr-actions'>
                    <button className='qr-action-btn share' onClick={() => navigator.clipboard.writeText(inviteLink)}>
                        <span className="material-symbols-rounded">share</span>
                        Share Link
                    </button>
                    <button className='qr-action-btn download'>
                        <span className="material-symbols-rounded">download</span>
                        Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteQR;