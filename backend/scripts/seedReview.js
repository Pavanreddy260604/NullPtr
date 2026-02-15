
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from one level up
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

// Define Schemas Inline to avoid import complexities
const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionType: { type: String, enum: ['mcq', 'fillblank', 'descriptive'], required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    isBookmarked: { type: Boolean, default: false },
    srs: {
        easeFactor: { type: Number, default: 2.5 },
        interval: { type: Number, default: 0 },
        repetitions: { type: Number, default: 0 },
        nextReviewDate: { type: Date, default: null },
        lastReviewRating: { type: Number, default: null }
    }
}, { timestamps: true });

const Progress = mongoose.model('ProgressSeed', progressSchema, 'progresses');

const mcqSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    question: String
});
const MCQ = mongoose.model('MCQSeed', mcqSchema, 'mcqs');

const userSchema = new mongoose.Schema({ email: String });
const User = mongoose.model('UserSeed', userSchema, 'users');

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.error('❌ No user found in database. Please register first.');
            process.exit(1);
        }
        console.log(`👤 Found user: ${user.email} (${user._id})`);

        const mcqs = await MCQ.find().limit(5);
        if (mcqs.length === 0) {
            console.error('❌ No MCQs found to seed progress for.');
            process.exit(1);
        }

        console.log(`📚 Seeding ${mcqs.length} review cards...`);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        for (const mcq of mcqs) {
            await Progress.findOneAndUpdate(
                { userId: user._id, questionId: mcq._id },
                {
                    userId: user._id,
                    questionId: mcq._id,
                    questionType: 'mcq',
                    subjectId: mcq.subjectId,
                    unitId: mcq.unitId,
                    isBookmarked: true,
                    srs: {
                        easeFactor: 2.5,
                        interval: 1,
                        repetitions: 1,
                        nextReviewDate: yesterday
                    }
                },
                { upsert: true, new: true }
            );
        }

        console.log('🚀 Successfully seeded 5 cards into the Review queue!');
        console.log('👉 Refresh your app and check the "Review" section.');

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error seeding data:', err);
    }
}

seed();
