
import mongoose from "mongoose";
const blockSchema = new mongoose.Schema({
    type: { type: String, enum: ['text', 'heading', 'subheading', 'list', 'diagram', 'image', 'callout', 'code'] },
    content: { type: String },
    items: [String],
    label: String,
    src: String,



});
const descriptiveSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    id: { type: String },
    question: { type: String, required: true },
    answer: [blockSchema],
    topic: { type: String }
}, { timestamps: true })
export default mongoose.model("Descriptive", descriptiveSchema)