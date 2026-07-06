import History from '../models/history.js';
import { validationResult } from 'express-validator';

// Add a new history entry (used internally by other controllers)
export const addHistoryEntry = async (userId, action, resourceId = null, details = {}) => {
  try {
    await History.create({ user: userId, action, resourceId, details });
  } catch (err) {
    console.error('Failed to add history entry:', err);
  }
};

// Endpoint: GET /api/history?page=1&limit=20
export const getUserHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  try {
    const total = await History.countDocuments({ user: req.user._id });
    const entries = await History.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    res.json({ success: true, total, page: parseInt(page), limit: parseInt(limit), entries });
  } catch (err) {
    console.error('Error fetching user history:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
