import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src_temp/models/User.js';
import PendingUser from '../src_temp/models/PendingUser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const userResult = await User.deleteMany({});
        console.log(`🗑️  Deleted ${userResult.deletedCount} users.`);

        const pendingResult = await PendingUser.deleteMany({});
        console.log(`🗑️  Deleted ${pendingResult.deletedCount} pending users.`);

        console.log('✨ Database user cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing users:', error);
        process.exit(1);
    }
};

clearUsers();
