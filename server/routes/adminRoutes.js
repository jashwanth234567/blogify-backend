import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Admin Login - returns httpOnly cookie
router.post('/login', async (req, res) => {
 try {
 const { email, password } = req.body;
 const user = await User.findOne({ email });
 if (!user) return res.status(400).json({ success: false, message: 'User not found' });
 const bcrypt = (await import('bcryptjs')).default;
 const match = await bcrypt.compare(password, user.password);
 if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });
 if (!user.isAdmin) return res.status(403).json({ success: false, message: 'Not an admin' });
 const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
 res.cookie('admin_token', token, { httpOnly: true, sameSite: 'strict', maxAge: 2 * 60 * 60 * 1000 });
 res.json({ success: true, token });
 } catch (err) {
 res.status(500).json({ success: false, message: err.message });
 }
});

router.get('/me', protect, async (req, res) => {
 if (!req.isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });
 const { _id, name, email, image } = req.user;
 res.json({ success: true, admin: { _id, name, email, image } });
});

router.post('/logout', (req, res) => {
 res.clearCookie('admin_token');
 res.json({ success: true, message: 'Logged out' });
});

router.post('/refresh', protect, async (req, res) => {
 if (!req.isAdmin) return res.status(403).json({ success: false, message: 'Access denied' });
 const token = jwt.sign({ userId: req.userId }, process.env.JWT_SECRET, { expiresIn: '2h' });
 res.cookie('admin_token', token, { httpOnly: true, sameSite: 'strict', maxAge: 2 * 60 * 60 * 1000 });
 res.json({ success: true, token });
});

export default router;
