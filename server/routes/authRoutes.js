import express from 'express';
import { loginLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import {
  registerUser,
  verifyUserOtp,
  resendUserOtp,
  loginUser,
  forgotPasswordUser,
  resetPasswordUser
} from '../controllers/authController.js';

const router = express.Router();

// 1. Sign-Up Registration
router.post('/register', registerUser);

// 2. OTP Verification
router.post('/verify-otp', verifyUserOtp);

// 3. Resend OTP (with 60s cooldown limit)
router.post('/resend-otp', otpLimiter, resendUserOtp);

// 4. User Login
router.post('/login', loginLimiter, loginUser);

// 5. Forgot Password Request (Generates 6-digit OTP to Email)
router.post('/forgot-password', otpLimiter, forgotPasswordUser);

// 6. Reset Password with OTP Verification
router.post('/reset-password', resetPasswordUser);

// 7. Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
