import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import Message from "../models/message.js"; 
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/**
 * 1. SIGNUP: Creates a new user and returns a token.
 * Note: Username is converted to lowercase for consistency.
 */
export const signup = async (req, res) => {
    const { fullName, username, email, password, bio } = req.body;
    try {
        if (!fullName || !username || !email || !password) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) return res.json({ success: false, message: "Email already exists" });

        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) return res.json({ success: false, message: "Username is already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            username: username.toLowerCase(), 
            email: email.toLowerCase(),
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);
        
        // Remove password from response for security
        const userToReturn = newUser.toObject();
        delete userToReturn.password;

        res.json({ success: true, userData: userToReturn, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * 2. LOGIN: Validates credentials and returns a 7-day token.
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = generateToken(user._id);
        
        const userToReturn = user.toObject();
        delete userToReturn.password;

        res.json({ success: true, userData: userToReturn, token, message: "Login successful" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * 3. UPDATE PROFILE: Handles Cloudinary uploads and profile finalization.
 * This is the critical fix for the "Profile Setup" redirect.
 */
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user?._id;

        if(!userId) return res.json({ success: false, message: "Unauthorized" });

        let updateData = { bio, fullName };

        if (profilePic && profilePic.startsWith("data:image")) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: "talkify_profiles",
            });
            updateData.profilePic = uploadResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        
        // We send this as 'user' to match what your ProfilePage.jsx logic expects
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * 4. GET USERS FOR SIDEBAR: Fetches everyone except the logged-in user.
 * Sorted by newest first so your Incognito test users appear immediately.
 */
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Fetch users sorted by 'createdAt' so latest users appear at the top
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password")
            .sort({ createdAt: -1 });

        // Aggregate unseen message counts
        const unseenCounts = await Message.aggregate([
            { $match: { receiverId: loggedInUserId, seen: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const unseenMessages = {};
        unseenCounts.forEach(item => {
            unseenMessages[item._id.toString()] = item.count;
        });

        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * 5. SEARCH: Dynamic regex search for usernames or full names.
 */
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, users: [] });

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } }, 
                {
                    $or: [
                        { username: { $regex: query, $options: "i" } },
                        { fullName: { $regex: query, $options: "i" } } 
                    ]
                }
            ]
        }).select("-password").limit(10);

        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * 6. CHECK AUTH: Simple route for frontend to verify session validity.
 */
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};

/**
 * 7. GET BY USERNAME: Helper for deep-linking or profile lookups.
 */
export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username.toLowerCase() }).select("-password");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};