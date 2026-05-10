import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import Message from "../models/message.js";

import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

import { sendOtpEmail } from "../lib/email.js";

/**
 * =========================================================
 * 1. SIGNUP
 * =========================================================
 */

export const signup = async (req, res) => {

    const { fullName, email, password } = req.body;

    try {

        if (!fullName || !email || !password) {

            return res.json({
                success: false,
                message: "Missing required fields"
            });
        }

        const existingEmail = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingEmail) {

            return res.json({
                success: false,
                message: "Email already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        const newUser = await User.create({

            fullName,

            email: email.toLowerCase(),

            password: hashedPassword,

            isVerified: false,

            isProfileComplete: false,

        });

        const generatedOtp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await Otp.create({
            email: email.toLowerCase(),
            otp: generatedOtp
        });

        console.log("About to send OTP email");

await sendOtpEmail(
    email.toLowerCase(),
    generatedOtp
);

console.log("OTP email function completed");
        const token = generateToken(newUser._id);

        const userToReturn = newUser.toObject();

        delete userToReturn.password;

        res.json({

            success: true,

            userData: userToReturn,

            token,

            message: "OTP sent to your email"

        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 2. VERIFY EMAIL OTP
 * =========================================================
 */

export const verifyEmail = async (req, res) => {

    try {

        const { otp } = req.body;

        const userId = req.user?._id;

        const user = await User.findById(userId);

        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const otpRecord = await Otp.findOne({
            email: user.email,
            otp
        });

        if (!otpRecord) {

            return res.json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        user.isVerified = true;

        await user.save();

        await Otp.deleteOne({
            _id: otpRecord._id
        });

        res.json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

// resend OTP logic
export const resendOtp = async (req, res) => {

    try {

        const userId = req.user?._id;

        const user = await User.findById(userId);

        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Generate New OTP

        const generatedOtp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Delete Old OTP

        await Otp.deleteMany({
            email: user.email
        });

        // Save New OTP

        await Otp.create({
            email: user.email,
            otp: generatedOtp
        });

        // Send Email

        await sendOtpEmail(
            user.email,
            generatedOtp
        );

        res.json({
            success: true,
            message: "OTP resent successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 3. COMPLETE PROFILE
 * =========================================================
 */

export const completeProfile = async (req, res) => {

    try {

        const {
            username,
            bio,
            link,
            profilePic
        } = req.body;

        const userId = req.user?._id;

        if (!username || username.trim().length < 3) {

            return res.json({
                success: false,
                message: "Username must be at least 3 characters"
            });
        }

        const existingUsername = await User.findOne({
            username: username.toLowerCase()
        });

        if (existingUsername) {

            return res.json({
                success: false,
                message: "Username already taken"
            });
        }

        let updateData = {

            username: username.toLowerCase(),

            bio,

            link,

            isProfileComplete: true

        };

        if (
            profilePic &&
            profilePic.startsWith("data:image")
        ) {

            const uploadResponse =
                await cloudinary.uploader.upload(
                    profilePic,
                    {
                        folder: "talkify_profiles",
                    }
                );

            updateData.profilePic =
                uploadResponse.secure_url;
        }

        const updatedUser =
            await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select("-password");

        res.json({
            success: true,
            userData: updatedUser
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 4. UPDATE PROFILE
 * =========================================================
 */

export const updateProfile = async (req, res) => {

    try {

        const {
            profilePic,
            bio,
            fullName
        } = req.body;

        const userId = req.user?._id;

        let updateData = {
            bio,
            fullName
        };

        if (
            profilePic &&
            profilePic.startsWith("data:image")
        ) {

            const uploadResponse =
                await cloudinary.uploader.upload(
                    profilePic,
                    {
                        folder: "talkify_profiles",
                    }
                );

            updateData.profilePic =
                uploadResponse.secure_url;
        }

        const updatedUser =
            await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select("-password");

        res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 5. LOGIN
 * =========================================================
 */

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {

            return res.json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const token = generateToken(user._id);

        const userToReturn = user.toObject();

        delete userToReturn.password;

        res.json({

            success: true,

            userData: userToReturn,

            token,

            message: "Login successful"

        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 6. GET USERS FOR SIDEBAR
 * =========================================================
 */

export const getUsersForSidebar = async (req, res) => {

    try {

        const loggedInUserId = req.user._id;

        const filteredUsers =
            await User.find({
                _id: { $ne: loggedInUserId }
            })
                .select("-password")
                .sort({ createdAt: -1 });

        const unseenCounts =
            await Message.aggregate([

                {
                    $match: {
                        receiverId: loggedInUserId,
                        seen: false
                    }
                },

                {
                    $group: {
                        _id: "$senderId",
                        count: { $sum: 1 }
                    }
                }

            ]);

        const unseenMessages = {};

        unseenCounts.forEach((item) => {

            unseenMessages[
                item._id.toString()
            ] = item.count;

        });

        res.json({
            success: true,
            users: filteredUsers,
            unseenMessages
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 7. SEARCH USERS
 * =========================================================
 */

export const searchUsers = async (req, res) => {

    try {

        const { query } = req.query;

        if (!query) {

            return res.json({
                success: true,
                users: []
            });
        }

        const users = await User.find({

            $and: [

                {
                    _id: {
                        $ne: req.user._id
                    }
                },

                {
                    $or: [

                        {
                            username: {
                                $regex: query,
                                $options: "i"
                            }
                        },

                        {
                            fullName: {
                                $regex: query,
                                $options: "i"
                            }
                        }

                    ]
                }

            ]

        })
            .select("-password")
            .limit(10);

        res.json({
            success: true,
            users
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * 8. CHECK AUTH
 * =========================================================
 */

export const checkAuth = (req, res) => {

    res.json({
        success: true,
        user: req.user
    });
};

export const updateEmail = async (req, res) => {

    try {

        const { email } = req.body;

        const userId = req.user?._id;

        // Check Existing Email

        const existingEmail = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingEmail) {

            return res.json({
                success: false,
                message: "Email already exists"
            });
        }



        // Update User Email



        const updatedUser =
            await User.findByIdAndUpdate(

                userId,

                {
                    email: email.toLowerCase(),
                    isVerified: false
                },

                { new: true }

            );

        // Generate New OTP

        const generatedOtp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Delete Old OTPs

        await Otp.deleteMany({
            email: updatedUser.email
        });

        // Save New OTP

        await Otp.create({
            email: updatedUser.email,
            otp: generatedOtp
        });

        // Send Email

        await sendOtpEmail(
            updatedUser.email,
            generatedOtp
        );

        res.json({
            success: true,
            userData: updatedUser,
            message: "Email updated successfully"
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};

/**
 * =========================================================
 * CHECK USERNAME AVAILABILITY
 * =========================================================
 */
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.json({ success: false, message: "Username is required" });
        }

        // Search for an existing user with this username
        const existingUser = await User.findOne({ 
            username: username.toLowerCase() 
        });

        // If no user is found, the username is available
        if (!existingUser) {
            return res.json({ success: true, available: true });
        }

        // If found, it's taken
        return res.json({ success: true, available: false });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};