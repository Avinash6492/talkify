import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        // 🛠️ Look for token in headers or cookies
        const token = req.headers.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.json({ success: false, message: "Unauthorized - No Token Provided" });
        }

        // 🛠️ Verify token (Fixed 'SECERT' typo to 'SECRET')
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.json({ success: false, message: "Unauthorized - Invalid Token" });
        }

        // 🛠️ Find user (Fixed 'UserId' to 'userId' to match your token payload)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // 🛠️ Attach user to request object
        req.user = user;
        
        // 🚀 Move to the next controller
        next();
    } catch (error) {
        console.log("Error in protectRoute:", error.message);
        res.json({ success: false, message: "Session expired or invalid token" });
    }
};