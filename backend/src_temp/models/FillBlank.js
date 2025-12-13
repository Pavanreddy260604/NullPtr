import mongoose from "mongoose";
const fillBlankSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    id: { type: String },
    question: { type: String },
    correctAnswer: { type: String },
    explanation: { type: String },
    topic: { type: String },
}, { timestamps: true })
export default mongoose.model("FillBlank", fillBlankSchema)