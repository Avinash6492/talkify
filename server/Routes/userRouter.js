import express from "express";
// 🛠️ Added 'getUsersForSidebar' and 'searchUsers' to the imports
import { 
    checkAuth, 
    login, 
    signup, 
    updateProfile, 
    getUsersForSidebar, 
    searchUsers 
} from "../controllers/userController.js"; 
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// --- Auth Routes ---
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protectRoute, checkAuth);

// --- Profile Routes ---
userRouter.put("/update-profile", protectRoute, updateProfile);

// --- 🔍 NEW: Sidebar & Search Routes ---
// This fetches users you have already chatted with or all users for the sidebar
userRouter.get("/contacts", protectRoute, getUsersForSidebar);

// This handles the real-time search from your Sidebar.jsx
userRouter.get("/search", protectRoute, searchUsers);

export default userRouter;