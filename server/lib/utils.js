import jwt from "jsonwebtoken"; // 👈 ADD THIS LINE

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};