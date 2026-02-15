
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const userId = '69918b0b68c9ceb24f622315';

        // Check raw collection
        const rawProgress = await mongoose.connection.db.collection('progresses').find({
            userId: new mongoose.Types.ObjectId(userId)
        }).toArray();
        console.log('Raw docs (ObjectId):', rawProgress.length);

        const rawProgressStr = await mongoose.connection.db.collection('progresses').find({
            userId: userId
        }).toArray();
        console.log('Raw docs (String):', rawProgressStr.length);

        if (rawProgress.length > 0) {
            const first = rawProgress[0];
            console.log('Sample Doc SRS:', first.srs);
            console.log('Sample Doc QuestionId:', first.questionId, typeof first.questionId);

            // Check if MCQ exists
            const mcq = await mongoose.connection.db.collection('mcqs').findOne({
                _id: new mongoose.Types.ObjectId(first.questionId)
            });
            console.log('MCQ found:', !!mcq);
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
check();
