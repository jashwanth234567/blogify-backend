import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    enum: ['register', 'reset'],
  },
  attempts: {
    type: Number,
    default: 0,
  },
  ip: {
    type: String,
    default: '127.0.0.1',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes TTL per security requirements
  },
});

// Index for fast lookups
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
