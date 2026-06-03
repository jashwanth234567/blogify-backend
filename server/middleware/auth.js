import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.json({ success: false, message: "Not Authorized" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.json({ success: false, message: "Not Authorized" });
        }
        req.userId = user._id;
        req.user = user;
        if (user.email === process.env.ADMIN_EMAIL) {
            req.isAdmin = true;
        } else {
            req.isAdmin = false;
        }
        next();
    } catch (error) {
        res.json({ success: false, message: "Invalid token" });
    }
};
