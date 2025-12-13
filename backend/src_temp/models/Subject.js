import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        code: {
            type: String,
            trim: true
        },
        description: {
            type: String
        },
        thumbnail: {
            type: String
        },
        units: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Unit" }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
