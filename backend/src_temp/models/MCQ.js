import mongoose from 'mongoose'
const mcqSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    id: { type: String },
    question: { type: String },
    options: [String],
    correctAnswer: Number,
    explanation: { type: String },
    topic: { type: String }
}, { timestamps: true })
export default mongoose.model('MCQ', mcqSchema)