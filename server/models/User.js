import mongoose from "mongoose";

// Fixed variable name to userSchema
const userSchema = new mongoose.Schema({
   
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String },
}, { timestamps: true });

// Fixed: Added the model name "User" and used the correct schema variable
const User = mongoose.model("User", userSchema);

export default User;