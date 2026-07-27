import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import History from '../models/history.js';
import { sendOtpEmail, sendWelcomeEmail } from '../configs/emailService.js';

// Helper to log audit history
const logHistory = async (userId, action, details) => {
  try {
    await History.create({ user: userId, action, details });
  } catch (err) {
    console.error('Failed to log history:', err.message);
  }
};

// Generate 6-digit numeric OTP code
const generateNumericOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 1. SIGN-UP CONTROLLER
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
  }

  try {
    const { name, email, password, confirmPassword } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (user && user.verified) {
      return res.status(400).json({ success: false, message: "Email is already registered and verified. Please login." });
    }

    // Password strength check (min 8 chars, 1 upper, 1 lower, 1 number, 1 special char)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const username = cleanEmail.split('@')[0] + "_" + Math.floor(100 + Math.random() * 900);

    if (!user) {
      user = await User.create({
        name: name.trim(),
        username,
        email: cleanEmail,
        password: hashedPassword,
        verified: false,
        isVerified: false,
        status: 'pending_verification',
        role: 'USER',
        isAdmin: false
      });
    } else {
      // Update existing unverified record with new details
      user.name = name.trim();
      user.password = hashedPassword;
      user.status = 'pending_verification';
      await user.save();
    }

    // Generate 6-digit OTP (expires in 10 minutes)
    const otpCode = generateNumericOtp();

    // Invalidate any existing OTPs for this email and purpose
    await Otp.deleteMany({ email: cleanEmail, purpose: 'register' });
    await Otp.create({
      email: cleanEmail,
      code: otpCode,
      purpose: 'register',
      ip: req.ip || '127.0.0.1'
    });

    // Send OTP via Email
    await sendOtpEmail(cleanEmail, user.name, otpCode, 'register');

    console.log(`[AUTH SIGN-UP] Registered pending user: ${cleanEmail} | Dev OTP: ${otpCode}`);

    res.status(201).json({
      success: true,
      requireOtp: true,
      email: cleanEmail,
      message: `Registration successful! A 6-digit verification code has been sent to your email.`
    });
  } catch (error) {
    console.error("[AUTH SIGN-UP ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. VERIFY OTP CONTROLLER
 * POST /api/auth/verify-otp
 */
export const verifyUserOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and 6-digit OTP code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Check rate limit: Find OTP record
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'register' }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP has expired or is invalid. Please click 'Resend OTP'." });
    }

    // Rate Limiting: Max 3 failed attempts per OTP
    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: "Maximum OTP verification attempts exceeded. Please request a new OTP." });
    }

    if (otpRecord.code !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 3 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP code. ${remaining} attempt(s) remaining.`
      });
    }

    // OTP verified successfully — update User
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    user.verified = true;
    user.isVerified = true;
    user.status = 'active';
    await user.save();

    // Invalidate OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    // Send Welcome Email
    sendWelcomeEmail(user.email, user.name);

    await logHistory(user._id, 'EMAIL_VERIFIED', { ip: req.ip });

    // Issue JWT tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Email verified successfully! Welcome to Blogify.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role || 'USER',
        verified: true,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error("[AUTH VERIFY OTP ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. RESEND OTP CONTROLLER
 * POST /api/auth/resend-otp
 */
export const resendUserOtp = async (req, res) => {
  try {
    const { email, purpose = 'register' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Cooldown check (60 seconds)
    const recentOtp = await Otp.findOne({ email: cleanEmail, purpose }).sort({ createdAt: -1 });
    if (recentOtp) {
      const timeElapsedSeconds = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
      if (timeElapsedSeconds < 60) {
        const remaining = Math.ceil(60 - timeElapsedSeconds);
        return res.status(429).json({
          success: false,
          cooldownRemaining: remaining,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`
        });
      }
    }

    const user = await User.findOne({ email: cleanEmail });
    if (purpose === 'register' && user && user.verified) {
      return res.status(400).json({ success: false, message: "Account is already verified. Please login." });
    }

    // Generate new OTP
    const newOtpCode = generateNumericOtp();

    await Otp.deleteMany({ email: cleanEmail, purpose });
    await Otp.create({
      email: cleanEmail,
      code: newOtpCode,
      purpose,
      ip: req.ip || '127.0.0.1'
    });

    await sendOtpEmail(cleanEmail, user?.name || "User", newOtpCode, purpose);

    console.log(`[AUTH RESEND OTP] New OTP generated for ${cleanEmail}: ${newOtpCode}`);

    res.json({
      success: true,
      message: `A new 6-digit OTP code has been sent to your email.`
    });
  } catch (error) {
    console.error("[AUTH RESEND OTP ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. LOGIN CONTROLLER
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
  }

  try {
    const { identifier, password, rememberMe } = req.body;
    const cleanId = (identifier || "").trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }]
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email/username or password." });
    }

    // Block admin accounts from public endpoint
    if (user.isAdmin || ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        isAdmin: true,
        message: "Admin accounts must log in via the Admin Portal.",
        redirectTo: "/admin/login"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email/username or password." });
    }

    // Require OTP Verification if email is not verified
    if (!user.verified && !user.isVerified) {
      // Auto-trigger OTP resend
      const otpCode = generateNumericOtp();
      await Otp.deleteMany({ email: user.email, purpose: 'register' });
      await Otp.create({ email: user.email, code: otpCode, purpose: 'register' });
      await sendOtpEmail(user.email, user.name, otpCode, 'register');

      return res.status(403).json({
        success: false,
        requireOtp: true,
        email: user.email,
        message: "Your email address is not verified. A 6-digit OTP has been sent to your email."
      });
    }

    if (user.isBlocked || user.status === 'blocked') {
      return res.status(403).json({ success: false, message: "Your account has been suspended. Please contact Support." });
    }

    // Generate JWT token
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
    });

    await logHistory(user._id, 'LOGIN', { ip: req.ip, userAgent: req.headers['user-agent'] });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role || 'USER',
        verified: true,
        isAdmin: false
      }
    });
  } catch (error) {
    console.error("[AUTH LOGIN ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. FORGOT PASSWORD CONTROLLER
 * POST /api/auth/forgot-password
 */
export const forgotPasswordUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Registered email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Prevent Account Enumeration: Return generic success regardless of user existence
    if (user) {
      const otpCode = generateNumericOtp();
      await Otp.deleteMany({ email: cleanEmail, purpose: 'reset' });
      await Otp.create({
        email: cleanEmail,
        code: otpCode,
        purpose: 'reset',
        ip: req.ip || '127.0.0.1'
      });

      await sendOtpEmail(cleanEmail, user.name, otpCode, 'reset');
      console.log(`[AUTH FORGOT PASSWORD] Generated Reset OTP for ${cleanEmail}: ${otpCode}`);
    }

    res.json({
      success: true,
      message: "If your email address is registered, a 6-digit password reset OTP has been sent."
    });
  } catch (error) {
    console.error("[AUTH FORGOT PASSWORD ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. RESET PASSWORD CONTROLLER
 * POST /api/auth/reset-password
 */
export const resetPasswordUser = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match." });
    }

    // Password strength check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      });
    }

    // Check OTP Record
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'reset' }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Reset OTP has expired or is invalid. Please request a new password reset." });
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: "Maximum OTP attempts exceeded. Please request a new reset code." });
    }

    if (otpRecord.code !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 3 - otpRecord.attempts;
      return res.status(400).json({ success: false, message: `Invalid OTP code. ${remaining} attempt(s) remaining.` });
    }

    // OTP Verified — Update User Password
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Invalidate OTP immediately
    await Otp.deleteOne({ _id: otpRecord._id });

    // Invalidate user active cookie session
    res.clearCookie('auth_token');

    await logHistory(user._id, 'PASSWORD_RESET_SUCCESS', { ip: req.ip });

    res.json({
      success: true,
      message: "Password reset successful! Please log in with your new password."
    });
  } catch (error) {
    console.error("[AUTH RESET PASSWORD ERROR]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
