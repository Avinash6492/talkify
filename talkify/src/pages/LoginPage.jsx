import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import LegalModal from '../Component/LegalModal'; 
import axiosInstance from '../Config/axios'; 
import "./LoginPage.css";

const LoginPage = () => {
    const navigate = useNavigate();
    
    const [currState, setCurrState] = useState("Sign up");
    const [isDataSubmitted, setIsDataSubmitted] = useState(false); 
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        bio: ""
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false); 
    const [legalType, setLegalType] = useState("terms");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false); // ✅ Added loading state

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // ✅ Start loading
        try {
            if (currState === "Login") {
                const res = await axiosInstance.post('/users/login', {
                    email: formData.email,
                    password: formData.password
                });
                if (res.data.success) {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("userData", JSON.stringify(res.data.userData));
                    navigate('/');
                } else {
                    alert(res.data.message);
                }
            } else {
                if (!isDataSubmitted) {
                    setIsDataSubmitted(true);
                } else {
                    const res = await axiosInstance.post('/users/signup', formData);
                    if (res.data.success) {
                        localStorage.setItem("token", res.data.token);
                        localStorage.setItem("userData", JSON.stringify(res.data.userData));
                        navigate('/profile'); 
                    } else {
                        alert(res.data.message);
                    }
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false); // ✅ Stop loading
        }
    };

    return (
        <div className='login-page-wrapper'>
            <div className='login-overlay'></div>
            <div className='login-content-split'>
                <div className='branding-section'>
                    <img src={assets.logo_big} alt="logo" className="login-logo-main" />
                    <div className='branding-text'>
                        <h1>Talkify</h1>
                        <p>Connect with the world, <br/> one message at a time.</p>
                    </div>
                </div>

                <div className='form-section'>
                    <form onSubmit={handleFormSubmit} className='login-form-bespoke'>
                        <h2 className='form-title'>{isDataSubmitted ? "Finalize Profile" : currState}</h2>

                        <div className='input-group'>
                            {!isDataSubmitted ? (
                                <>
                                    {currState === "Sign up" && (
                                        <>
                                            <input name="fullName" type="text" placeholder='Full Name' className='login-input' onChange={handleInputChange} required />
                                            <input name="username" type="text" placeholder='Username' className='login-input' onChange={handleInputChange} required />
                                        </>
                                    )}
                                    <input name="email" type="email" placeholder='Email Address' className='login-input' onChange={handleInputChange} required />
                                    <div className="password-input-wrapper">
                                        <input name="password" type={showPassword ? "text" : "password"} placeholder='Password' className='login-input' onChange={handleInputChange} required />
                                        <span className="material-symbols-rounded password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? "visibility" : "visibility_off"}
                                        </span>
                                    </div>
                                    {currState === "Sign up" && (
                                        <label className='terms-label-bespoke'>
                                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                                            <span>I agree to <b onClick={() => {setLegalType('terms'); setIsModalOpen(true)}}>Terms</b> & <b onClick={() => {setLegalType('privacy'); setIsModalOpen(true)}}>Privacy</b></span>
                                        </label>
                                    )}
                                </>
                            ) : (
                                <textarea name="bio" rows={4} className='login-input' placeholder='Write a short bio...' onChange={handleInputChange} required />
                            )}
                        </div>

                        {/* ✅ Button shows loading state and is disabled during API call */}
                        <button type='submit' className="login-action-btn" disabled={loading}>
                            {loading ? "Please wait..." : isDataSubmitted ? "Get Started" : (currState === "Login" ? "Login" : "Next")}
                        </button>

                        {!isDataSubmitted && (
                            <p className='toggle-footer'>
                                {currState === "Sign up" ? "Already a member? " : "New here? "}
                                <span onClick={() => setCurrState(currState === "Sign up" ? "Login" : "Sign up")}>
                                    {currState === "Sign up" ? "Login" : "Sign Up"}
                                </span>
                            </p>
                        )}
                    </form>
                </div>
            </div>
            <LegalModal type={legalType} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default LoginPage;