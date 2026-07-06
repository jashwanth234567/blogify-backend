import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUserHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', protect, getUserHistory);

export default router;
