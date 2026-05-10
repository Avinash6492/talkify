import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Step 1: Initial Signup Fields
    fullName: { type: String, required: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    
    // Step 2: Collected in the "Complete Profile" Popup
    // Note: username is no longer 'required' initially to prevent signup errors
    username: { 
        type: String, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        sparse: true // Allows multiple 'null' values until user sets their username
    }, 
    bio: { type: String, default: "" },
    link: { type: String, default: "" },
    profilePic: { type: String, default: "" },

    // Verification & Onboarding Flags
    isVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },

    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;