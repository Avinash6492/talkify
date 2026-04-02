import Group from "../models/Group.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// 1. Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, members, groupProfilePic } = req.body;
        const adminId = req.user._id;

        let imageUrl = "";
        if (groupProfilePic) {
            const upload = await cloudinary.uploader.upload(groupProfilePic);
            imageUrl = upload.secure_url;
        }

        // Add the admin to the members list automatically
        const allMembers = [...new Set([...members, adminId])];

        const newGroup = await Group.create({
            name,
            groupProfilePic: imageUrl,
            admin: adminId,
            members: allMembers
        });

        res.status(201).json({ success: true, group: newGroup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. 🚨 FIX: Ensure this function is exported!
export const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find groups where the current user is a member
        const groups = await Group.find({ members: userId })
            .populate("members", "-password")
            .populate("admin", "-password");

        res.json({ success: true, groups });
    } catch (error) {
        console.log("Error in getMyGroups:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};