import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './server/.env' });

const { MONGODB_URI, LOCAL_MONGODB_URI, ADMIN_EMAIL } = process.env;
const mongoUri = MONGODB_URI || LOCAL_MONGODB_URI;

(async () => {
  try {
    await mongoose.connect(mongoUri);
    const result = await User.updateMany({ email: ADMIN_EMAIL }, { $set: { isAdmin: true } });
    console.log(`Updated ${result.modifiedCount || result.nModified || 0} user(s) to admin`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin:', err);
    process.exit(1);
  }
})();
