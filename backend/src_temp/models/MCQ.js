import mongoose from 'mongoose'
const mcqSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    id: { type: String },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String },
    topic: { type: String }
}, { timestamps: true })
export default mongoose.model('MCQ', mcqSchema)