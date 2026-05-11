import express from "express";


import {
    checkAuth,
    login,
    signup,
    updateProfile,
    verifyEmail,
    resendOtp,
    updateEmail,
    completeProfile,
    getUsersForSidebar,
    searchUsers,
    checkUsername // ✅ Added missing import
} from "../controllers/userController.js";

import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// --- Auth Routes ---

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.get("/check", protectRoute, checkAuth);

// ✅ FIXED: Changed 'router' to 'userRouter' to match your definition
userRouter.get("/check-username", checkUsername); 

// --- Onboarding Routes ---

userRouter.post(
    "/verify-email",
    protectRoute,
    verifyEmail
);

userRouter.post(
    "/resend-otp",
    protectRoute,
    resendOtp
);

userRouter.put(
    "/update-email",
    protectRoute,
    updateEmail
);

userRouter.post(
    "/complete-profile",
    protectRoute,
    completeProfile
);

// --- Profile Routes ---

userRouter.put(
    "/update-profile",
    protectRoute,
    updateProfile
);

// --- Sidebar & Search Routes ---

userRouter.get(
    "/contacts",
    protectRoute,
    getUsersForSidebar
);

userRouter.get(
    "/search",
    protectRoute,
    searchUsers
);


export default userRouter;