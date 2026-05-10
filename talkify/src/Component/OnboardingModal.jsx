import React, { useState } from "react";
import axiosInstance from "../Config/axios";
import assets from "../assets/assets";
import "./OnboardingModal.css";

const OnboardingModal = ({ onComplete }) => {
    const [step, setStep] = useState(1); // 1: OTP, 2: Profile Setup
    const [loading, setLoading] = useState(false);
    
    // Step 1 Data
    const [otp, setOtp] = useState("");

    const [timer, setTimer] = useState(60);
const [canResend, setCanResend] = useState(false);

const [editingEmail, setEditingEmail] = useState(false);

const [email, setEmail] = useState(
    JSON.parse(localStorage.getItem("userData"))?.email || ""
);

    // Step 2 Data
    const [profileData, setProfileData] = useState({
        username: "",
        bio: "",
        link: "",
        profilePic: ""
    });

    // --- Handlers ---

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.post("/users/verify-email", { otp });
            if (res.data.success) {
                setStep(2); // Move to profile setup
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Verification failed. Please check the code.");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.post("/users/complete-profile", profileData);
            if (res.data.success) {
                // Update local storage and close modal
                const updatedUser = res.data.userData;
                localStorage.setItem("userData", JSON.stringify(updatedUser));
                onComplete(updatedUser);
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Error saving profile details.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {

    let interval;

    if (step === 1 && timer > 0) {

        interval = setInterval(() => {

            setTimer((prev) => prev - 1);

        }, 1000);

    } else if (timer === 0) {

        setCanResend(true);
    }

    return () => clearInterval(interval);

}, [timer, step]);

const handleResendOtp = async () => {

    try {

        const res = await axiosInstance.post(
            "/users/resend-otp"
        );

        if (res.data.success) {

            alert("OTP resent successfully");

            setTimer(60);

            setCanResend(false);

        } else {

            alert(res.data.message);
        }

    } catch (err) {

        alert("Failed to resend OTP");
    }
};

const handleUpdateEmail = async () => {

    try {

        const res = await axiosInstance.put(
            "/users/update-email",
            { email }
        );

        if (res.data.success) {

            localStorage.setItem(
                "userData",
                JSON.stringify(res.data.userData)
            );

            alert(
                "OTP sent to updated email"
            );

            setEditingEmail(false);

            setTimer(60);

            setCanResend(false);

        } else {

            alert(res.data.message);
        }

    } catch (err) {

        alert("Failed to update email");
    }
};

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card animate-pop">
                {step === 1 ? (
                    <div className="onboarding-step">
                        <h2>Verify Your Email</h2>
                        <div className="otp-email-info">

    {!editingEmail ? (

        <>

            <p>
                We've sent a 6-digit code to:
            </p>

            <h4>{email}</h4>

            <span
                className="edit-email-btn"
                onClick={() => setEditingEmail(true)}
            >
                Edit Email
            </span>

        </>

    ) : (

        <div className="edit-email-box">

            <input
                type="email"
                value={email}
                className="onboarding-input"
                onChange={(e) =>
                    setEmail(e.target.value)
                }
            />

            <button
                type="button"
                className="onboarding-btn"
                onClick={handleUpdateEmail}
            >
                Update Email
            </button>

        </div>

    )}

</div>
                        <form onSubmit={handleVerifyOtp}>
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit OTP" 
                                maxLength="6"
                                className="onboarding-input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading} className="onboarding-btn">
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>

                            <p className="resend-text">

    {canResend ? (

        <span
            className="resend-btn"
            onClick={handleResendOtp}
        >
            Resend OTP
        </span>

    ) : (

        `Resend OTP in ${timer}s`

    )}

</p>
                        </form>
                    </div>
                ) : (
                    <div className="onboarding-step">
                        <h2>Setup Your Profile</h2>
                        <p>Tell the world who you are.</p>
                        <form onSubmit={handleCompleteProfile}>
                            <input 
                                type="text" 
                                placeholder="Username" 
                                className="onboarding-input"
                                value={profileData.username}
                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                required
                            />
                            <textarea 
                                placeholder="Bio" 
                                className="onboarding-input onboarding-textarea"
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            />
                            <input 
                                type="text" 
                                placeholder="Link (Website/Social)" 
                                className="onboarding-input"
                                value={profileData.link}
                                onChange={(e) => setProfileData({...profileData, link: e.target.value})}
                            />
                            <button type="submit" disabled={loading} className="onboarding-btn">
                                {loading ? "Saving..." : "Start Chatting"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;