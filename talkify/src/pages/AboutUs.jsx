import React from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import "./AboutUs.css";

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className='about-page-container'>
            <div className='about-card animate-in'>
                <div className='about-header'>
                    <button className='back-btn' onClick={() => navigate('/')}>
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h2>About Talkify</h2>
                </div>

                <div className='about-content'>
                    <div className='about-hero'>
                        <img src={assets.logo_big} alt="Talkify Logo" className='about-logo' />
                        <h3>Version 1.0.4</h3>
                        <p className='tagline'>Connecting the world, one message at a time.</p>
                    </div>

                    <div className='about-sections'>
                        <div className='info-box'>
                            <h4>Our Vision</h4>
                            <p>Talkify was built to provide a seamless, secure, and bespoke messaging experience for creators and developers. We believe communication should be beautiful and private.</p>
                        </div>

                        <div className='features-list'>
                            <div className='feature-item'>
                                <span className="material-symbols-rounded">security</span>
                                <div>
                                    <h5>End-to-End Security</h5>
                                    <p>Your data is encrypted and private by default.</p>
                                </div>
                            </div>
                            <div className='feature-item'>
                                <span className="material-symbols-rounded">palette</span>
                                <div>
                                    <h5>Bespoke UI</h5>
                                    <p>A hand-crafted interface designed for focus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='about-footer'>
                    <p>© 2026 Talkify Inc. Made with ❤️ by Avinash Maurya</p>
                    <div className='social-links'>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;