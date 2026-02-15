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

const checkUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({}, 'email');
        const pending = await PendingUser.find({}, 'email');

        console.log('\n--- Current Database State ---');
        console.log(`Users (${users.length}):`, users.map(u => u.email));
        console.log(`Pending Users (${pending.length}):`, pending.map(u => u.email));
        console.log('------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkUsers();
