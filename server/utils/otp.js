import Otp from '../models/Otp.js';
import { sendEmail } from './email.js';

export const generateAndSendOtp = async (email, purpose) => {
  // Check cooldown (60 seconds)
  const recentOtp = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (recentOtp) {
    const timeSinceLastOtp = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (timeSinceLastOtp < parseInt(process.env.OTP_COOLDOWN || 60)) {
      throw new Error(`Please wait ${Math.ceil(60 - timeSinceLastOtp)} seconds before requesting a new OTP.`);
    }
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to DB
  await Otp.create({ email, code, purpose });

  // Send Email
  const subject = purpose === 'register' ? 'Verify your Blogify Account' : 'Reset your Blogify Password';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Blogify</h2>
      <p>Your OTP for ${purpose === 'register' ? 'account registration' : 'password reset'} is:</p>
      <h1 style="color: #4f46e5; letter-spacing: 5px;">${code}</h1>
      <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  const result = await sendEmail({ to: email, subject, html });
  if (!result.success) {
    throw new Error('Failed to send OTP email');
  }

  return true;
};

export const verifyOtp = async (email, code, purpose) => {
  const otpRecord = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error('No OTP requested or OTP has expired.');
  }

  if (otpRecord.code !== code) {
    throw new Error('Invalid OTP code.');
  }

  // Optional: delete OTP after successful verification so it can't be reused
  await Otp.deleteOne({ _id: otpRecord._id });

  return true;
};
