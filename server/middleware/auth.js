import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    
    // Check cookies if header is missing
    if (!token && req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    } else if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

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
