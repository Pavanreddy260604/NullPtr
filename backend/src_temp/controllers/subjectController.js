import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";
import { deleteFromCloudinary } from "../utils/cloudinaryCleanup.js";
export const createSubject = async (req, res) => {
    try {

        const subject = await Subject.create(req.body)
        res.status(201).json({
            message: "Subject created successfully",
            subject
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating subject",
            error: error.message
        })
    }
}
export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate("units");
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const updateSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.status(200).json({ message: "Subject updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const deleteSubjectById = async (req, res) => {
    try {
        // 1️⃣ Find subject and populate units before deletion
        const subject = await Subject.findById(req.params.id).populate("units");
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // 2️⃣ Delete Cloudinary thumbnail if present
        if (subject.thumbnail) {
            await deleteFromCloudinary(subject.thumbnail);
        }

        // 3️⃣ Delete all related units and their questions
        for (const unit of subject.units) {
            // Delete MCQs and FillBlanks
            await MCQ.deleteMany({ unitId: unit._id });
            await FillBlank.deleteMany({ unitId: unit._id });

            // Delete descriptive questions and their Cloudinary diagrams
            const descriptives = await Descriptive.find({ unitId: unit._id });
            for (const desc of descriptives) {
                for (const block of desc.answer || []) {
                    if (block.type === "diagram" && block.content?.includes("cloudinary")) {
                        await deleteFromCloudinary(block.content);
                    }
                }
            }
            await Descriptive.deleteMany({ unitId: unit._id });

            // Finally delete the unit itself
            await Unit.findByIdAndDelete(unit._id);
        }

        // 4️⃣ Delete subject itself
        await subject.deleteOne();

        res.status(200).json({ message: "🗑️ Subject and all related data deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting subject:", error);
        res.status(500).json({ message: error.message });
    }
};