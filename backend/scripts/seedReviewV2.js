
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// STRICT SCHEMA MATCHING Progress.js
const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionId: { type: String, required: true },
    questionType: { type: String, required: true },
    subjectId: { type: String, required: true },
    unitId: { type: String, required: true },
    topic: { type: String, default: null },
    srs: {
        easeFactor: { type: Number, default: 2.5 },
        interval: { type: Number, default: 1 },
        repetitions: { type: Number, default: 1 },
        nextReviewDate: { type: Date, default: null }
    },
    isBookmarked: { type: Boolean, default: true }
}, { collection: 'progresses', timestamps: true });

const Progress = mongoose.model('ProgressSeedV2', progressSchema);

const mcqSchema = new mongoose.Schema({
    subjectId: mongoose.Schema.Types.ObjectId,
    unitId: mongoose.Schema.Types.ObjectId,
    question: String
}, { collection: 'mcqs' });
const MCQ = mongoose.model('MCQSeed', mcqSchema);

const userSchema = new mongoose.Schema({ email: String }, { collection: 'users' });
const User = mongoose.model('UserSeed', userSchema);

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.error('❌ No user found');
            process.exit(1);
        }
        console.log(`👤 Hosting session for: ${user.email} (${user._id})`);

        // Clear existing progress for this user to avoid confusion
        await Progress.deleteMany({ userId: user._id });
        console.log('🧹 Cleared existing progress for user.');

        const mcqs = await MCQ.find().limit(5);
        console.log(`📚 Found ${mcqs.length} MCQs to seed.`);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        for (const mcq of mcqs) {
            const p = new Progress({
                userId: user._id, // This will be saved as ObjectId
                questionId: mcq._id.toString(), // MUST BE STRING
                questionType: 'mcq',
                subjectId: mcq.subjectId.toString(), // MUST BE STRING
                unitId: mcq.unitId.toString(), // MUST BE STRING
                topic: 'Seeded Test',
                srs: {
                    easeFactor: 2.5,
                    interval: 1,
                    repetitions: 1,
                    nextReviewDate: yesterday
                }
            });
            await p.save();
        }

        console.log('🚀 SEED SUCCESS: 5 cards injected with correct types.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

seed();
