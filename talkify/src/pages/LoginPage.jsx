import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LegalModal from "../Component/LegalModal";
import axiosInstance from "../Config/axios";
import "./LoginPage.css";

const LoginPage = () => {

    const navigate = useNavigate();

    const [currState, setCurrState] = useState("Sign up");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [legalType, setLegalType] = useState("terms");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // =========================
    // Handle Input Change
    // =========================

    const handleInputChange = (e) => {

        const { name, value } = e.target;

        // Full Name Validation
        if (name === "fullName") {

            const onlyLetters = /^[A-Za-z\s]*$/;

            if (!onlyLetters.test(value)) {
                return;
            }
        }

        if (name === "password") {

    // No spaces allowed
    if (value.includes(" ")) {
        return;
    }

    // Max 8 characters
    if (value.length > 8) {
        return;
    }
}

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // =========================
    // Handle Form Submit
    // =========================

    const handleFormSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            // ================= LOGIN =================

            if (currState === "Login") {

                const res = await axiosInstance.post("/users/login", {
                    email: formData.email,
                    password: formData.password,
                });

                if (res.data.success) {

                    localStorage.setItem("token", res.data.token);

                    localStorage.setItem(
                        "userData",
                        JSON.stringify(res.data.userData)
                    );

                    window.dispatchEvent(new Event("authChange"));

                    setTimeout(() => {
    navigate("/chat");
}, 100);
                } else {
                    alert(res.data.message);
                }

            }

            // ================= SIGNUP =================

            else {

                const res = await axiosInstance.post(
                    "/users/signup",
                    formData
                );

                if (res.data.success) {

                    localStorage.setItem("token", res.data.token);

                    // Add onboarding flag
                    const updatedUser = {
                        ...res.data.userData,
                        isProfileComplete: false,
                    };

                    localStorage.setItem(
                        "userData",
                        JSON.stringify(updatedUser)
                    );

                    window.dispatchEvent(new Event("authChange"));

                    // Go to Home Page
                  navigate("/chat");

                } else {
                    alert(res.data.message);
                }
            }

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Authentication failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="login-page-wrapper">

            <div className="login-overlay"></div>

            <div className="login-content-split">

                {/* ================= Branding Section ================= */}

                <div className="branding-section">

                    <div className="branding-text">

                        <h1>Talkify</h1>

                        <p>
                            Connect with the world,
                            <br />
                            one message at a time.
                        </p>

                    </div>

                </div>

                {/* ================= Form Section ================= */}

                <div className="form-section">

                    <form
                        onSubmit={handleFormSubmit}
                        className="login-form-bespoke"
                    >

                        <h2 className="form-title">
                            {currState}
                        </h2>

                        <div className="input-group">

                            {/* Full Name */}

                            {currState === "Sign up" && (

                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    className="login-input"
                                    onChange={handleInputChange}
                                    required
                                    maxLength={30}
                                />

                            )}

                            {/* Email */}

                            <input
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                className="login-input"
                                onChange={handleInputChange}
                                required
                            />

                            {/* Password */}

                            <div className="password-input-wrapper">

                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="login-input"
                                    onChange={handleInputChange}
                                    required
                                    maxLength={8}
                                />

                                <span
                                    className="material-symbols-rounded password-toggle-icon"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword
                                        ? "visibility"
                                        : "visibility_off"}
                                </span>

                            </div>

                            {/* Forgot Password */}

                            {currState === "Login" && (

                                <p
                                    className="forgot-password-link"
                                    onClick={() =>
                                        alert("Redirecting to reset password...")
                                    }
                                >
                                    Forgot Password?
                                </p>

                            )}

                            {/* Terms & Privacy */}

                            {currState === "Sign up" && (

                                <label className="terms-label-bespoke">

                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) =>
                                            setAgreed(e.target.checked)
                                        }
                                        required
                                    />

                                    <span>

                                        I agree to

                                        <b
                                            onClick={() => {
                                                setLegalType("terms");
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            {" "}Terms{" "}
                                        </b>

                                        &

                                        <b
                                            onClick={() => {
                                                setLegalType("privacy");
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            {" "}Privacy
                                        </b>

                                    </span>

                                </label>

                            )}

                        </div>

                        {/* Submit Button */}

                        <button
                            type="submit"
                            className="login-action-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Please wait..."
                                : currState === "Login"
                                    ? "Login"
                                    : "Create Account"}

                        </button>

                        {/* Toggle Footer */}

                        <p className="toggle-footer">

                            {currState === "Sign up"
                                ? "Already a member? "
                                : "New here? "}

                            <span
                                onClick={() =>
                                    setCurrState(
                                        currState === "Sign up"
                                            ? "Login"
                                            : "Sign up"
                                    )
                                }
                            >

                                {currState === "Sign up"
                                    ? "Login"
                                    : "Sign Up"}

                            </span>

                        </p>

                    </form>

                </div>

            </div>

            {/* ================= Legal Modal ================= */}

            <LegalModal
                type={legalType}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </div>
    );
};

export default LoginPage;