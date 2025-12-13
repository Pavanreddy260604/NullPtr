import mongoose from 'mongoose';
const unitSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unit: { type: Number, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    mcqs: [{ type: mongoose.Schema.Types.ObjectId, ref: "MCQ" }],
    fillBlanks: [{ type: mongoose.Schema.Types.ObjectId, ref: "FillBlank" }],
    descriptive: [{ type: mongoose.Schema.Types.ObjectId, ref: "Descriptive" }],

}, { timestamps: true })
export default mongoose.model("Unit", unitSchema)