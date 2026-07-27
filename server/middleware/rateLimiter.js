import rateLimit from 'express-rate-limit';

// Limit repeated login requests
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Increased limit for test environment / automated E2E suites
  message: { success: false, message: 'Too many login attempts, please try again after 10 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit repeated OTP requests
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 request per minute
  message: { success: false, message: 'Please wait 60 seconds before requesting a new OTP' },
  standardHeaders: true,
  legacyHeaders: false,
});
