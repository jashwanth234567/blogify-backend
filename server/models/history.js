import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., BLOG_CREATED, AI_TRANSLATED
  resourceId: { type: String }, // optional id of related resource (blog id, comment id, etc.)
  details: { type: mongoose.Schema.Types.Mixed }, // any additional payload
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('History', historySchema);
