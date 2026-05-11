import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import assets from '../assets/assets';
import "./LandingPage.css";

const LandingPage = ({ isDarkMode, toggleTheme }) => {
    const navigate = useNavigate();

    // Animation Variants for smooth scrolling reveals
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className={`lp-container ${isDarkMode ? 'dark' : 'light'}`}>
            {/* --- SECTION 0: NAVIGATION --- */}
            <nav className="lp-nav">
                <div className="lp-logo">
                    <img src={assets.logo_icon} alt="Talkify Logo" />
                    <span>Talkify</span>
                </div>
                <div className="nav-right">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        <span className="material-symbols-rounded">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button className="nav-login-btn" onClick={() => navigate('/login')}>
                        Login / Sign Up
                    </button>
                </div>
            </nav>

            {/* --- SECTION 1: HERO --- */}
            <header className="lp-hero">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="hero-text"
                >
                    <div className="hero-badge">BCA Final Project 2026</div>
                    <h1 className="hero-title">Talkify: The Future of <br/><span className="gradient-text">Connection.</span></h1>
                    <p className="hero-subtitle">
                        A high-performance real-time chat suite built with the MERN stack. 
                        Experience sub-millisecond messaging and robust security.
                    </p>
                    <div className="hero-action-row">
                        <button className="hero-cta" onClick={() => navigate('/login')}>Get Started Free</button>
                        <div className="hero-icons">
                            <span className="material-symbols-rounded">shield</span>
                            <span className="material-symbols-rounded">bolt</span>
                            <span className="material-symbols-rounded">devices</span>
                        </div>
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="hero-banner"
                >
                    <img src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop" alt="Talkify Banner" />
                </motion.div>
            </header>

            {/* --- SECTION 2: CORE FEATURES --- */}
            <section className="lp-features">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="feature-intro"
                >
                    <span className="section-tag">Core Features</span>
                    <h2 className="section-h2">What's Inside Talkify?</h2>
                </motion.div>

                <div className="feature-grid">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="f-card">
                        <span className="material-symbols-rounded">hub</span>
                        <h3>Real-time Engine</h3>
                        <p>Powered by Socket.io for instant message delivery and live presence status updates.</p>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="f-card">
                        <span className="material-symbols-rounded">security</span>
                        <h3>Secure Access</h3>
                        <p>JWT-based authentication and Bcrypt hashing ensure your data remains protected.</p>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="f-card">
                        <span className="material-symbols-rounded">brush</span>
                        <h3>Bespoke UI</h3>
                        <p>Clean, modern interface designed with Framer Motion and responsive CSS for all screens.</p>
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 3: FUTURE ROADMAP --- */}
            <section className="lp-future">
                <div className="future-box">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="future-info"
                    >
                        <span className="section-tag">Roadmap</span>
                        <h2 className="section-h2">Expanding the Vision</h2>
                        <ul className="future-list">
                            <li>
                                <span className="material-symbols-rounded">smart_toy</span>
                                <div>
                                    <strong>AI Integration:</strong>
                                    <p>Smart replies and automated message translation coming soon.</p>
                                </div>
                            </li>
                            <li>
                                <span className="material-symbols-rounded">ad_units</span>
                                <div>
                                    <strong>Mobile Launch:</strong>
                                    <p>Native Android and iOS builds are currently in testing.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="future-visual"
                    >
                        <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop" alt="AI Tech" />
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 4: ABOUT US --- */}
            <footer className="lp-about">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="about-card"
                >
                    <h2>About the Developer</h2>
                    <p>
                        Talkify was designed and engineered by <strong>Avinash Maurya</strong> and <strong>Akash Vishwakarma</strong>. 
                        This project serves as a comprehensive demonstration of Full-Stack MERN 
                        capabilities, focusing on real-time data flow and modern design principles.
                    </p>
                    <div className="about-stack">
                        <span>MongoDB</span> • <span>Express</span> • <span>React</span> • <span>Node.js</span>
                    </div>
                </motion.div>
                <div className="lp-copyright">
                    © 2026 Talkify Project • Built for the Future
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;