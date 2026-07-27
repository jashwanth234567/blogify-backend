import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Full auth - blocks if not logged in
const extractToken = (req) => {
    let token = req.headers.authorization;
    if (!token && req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    }
    return token || null;
};

export const protect = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.json({ success: false, message: "Not Authorized" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        if (user.isDeleted || user.status === "deleted") {
            return res.status(403).json({ success: false, message: "Account has been deleted" });
        }
        if (user.isBlocked || user.status === "blocked") {
            return res.status(403).json({ success: false, isBlocked: true, message: "Your account has been suspended or blocked. Please contact the administrator." });
        }
        if (user.isSuspended && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
            return res.status(403).json({ success: false, isSuspended: true, message: "Your account has been suspended or blocked. Please contact the administrator." });
        }

        req.userId = user._id;
        req.user = user;
        req.userRole = user.role || (user.isAdmin ? "ADMIN" : "USER");
        req.isAdmin = user.isAdmin || ["ADMIN", "SUPER_ADMIN"].includes(user.role) || user.email === process.env.ADMIN_EMAIL;

        next();
    } catch (error) {
        res.json({ success: false, message: "Invalid token" });
    }
};

// Optional auth - doesn't block if not logged in, just attaches user if token exists
export const optionalProtect = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return next(); // Not logged in — continue without user
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.userId);
        if (user && !user.isDeleted && !user.isBlocked) {
            req.userId = user._id;
            req.user = user;
            req.userRole = user.role || (user.isAdmin ? "ADMIN" : "USER");
            req.isAdmin = user.isAdmin || ["ADMIN", "SUPER_ADMIN"].includes(user.role) || user.email === process.env.ADMIN_EMAIL;
        }
    } catch {
        // Invalid token - just continue without auth
    }

    next();
};
