// src/controllers/questionController.js
import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";
import Unit from "../models/Unit.js";
import mongoose from "mongoose";

/**
 * 🧩 Helper to validate IDs
 */
const validateIds = (res, unitId, subjectId) => {
    if (!unitId || !subjectId) {
        res.status(400).json({ message: "unitId and subjectId are required" });
        return false;
    }
    if (!mongoose.Types.ObjectId.isValid(unitId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
        res.status(400).json({ message: "Invalid unitId or subjectId format" });
        return false;
    }
    return true;
};

/**
 * ✅ Create MCQ
 */
export const createMCQ = async (req, res) => {
    try {
        const { unitId, subjectId } = req.body;
        if (!validateIds(res, unitId, subjectId)) return;

        const mcq = await MCQ.create({ ...req.body, unitId, subjectId });
        await Unit.findByIdAndUpdate(unitId, { $push: { mcqs: mcq._id } });

        res.status(201).json({ message: "✅ MCQ created successfully", mcq });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getMCQsByUnit = async (req, res) => {
    try {
        const mcqs = await MCQ.find({ unitId: req.params.unitId });
        res.status(200).json(mcqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * ✅ Create FillBlank
 */
export const createFillBlank = async (req, res) => {
    try {
        const { unitId, subjectId } = req.body;
        if (!validateIds(res, unitId, subjectId)) return;

        const fb = await FillBlank.create({ ...req.body, unitId, subjectId });
        await Unit.findByIdAndUpdate(unitId, { $push: { fillBlanks: fb._id } });

        res.status(201).json({ message: "✅ FillBlank created successfully", fb });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getFillBlanksByUnit = async (req, res) => {
    try {
        const fillBlanks = await FillBlank.find({ unitId: req.params.unitId })
        res.status(200).json(fillBlanks)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * ✅ Create Descriptive
 */
export const createDescriptive = async (req, res) => {
    try {
        const { unitId, subjectId } = req.body;
        if (!validateIds(res, unitId, subjectId)) return;

        const desc = await Descriptive.create({ ...req.body, unitId, subjectId });
        await Unit.findByIdAndUpdate(unitId, { $push: { descriptive: desc._id } });

        res.status(201).json({ message: "✅ Descriptive created successfully", desc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDescriptivesByUnit = async (req, res) => {
    try {
        const descriptives = await Descriptive.find({ unitId: req.params.unitId })
        res.status(200).json(descriptives)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateMCQById = async (req, res) => {
    try {
        const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mcq) {
            return res.status(404).json({ message: "MCQ not found" });
        }
        res.status(200).json({ message: "MCQ updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateFillBlankById = async (req, res) => {
    try {
        const fb = await FillBlank.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fb) {
            return res.status(404).json({ message: "FillBlank not found" });
        }
        res.status(200).json({ message: "FillBlank updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateDescriptiveById = async (req, res) => {
    try {
        const desc = await Descriptive.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!desc) {
            return res.status(404).json({ message: "Descriptive not found" });
        }
        res.status(200).json({ message: "Descriptive updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteMCQById = async (req, res) => {
    try {
        const mcq = await MCQ.findByIdAndDelete(req.params.id);
        if (!mcq) {
            return res.status(404).json({ message: "MCQ not found" });
        }
        res.status(200).json({ message: "MCQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteFillBlankById = async (req, res) => {
    try {
        const fb = await FillBlank.findByIdAndDelete(req.params.id);
        if (!fb) {
            return res.status(404).json({ message: "FillBlank not found" });
        }
        res.status(200).json({ message: "FillBlank deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



export const deleteDescriptiveById = async (req, res) => {
    try {
        const desc = await Descriptive.findById(req.params.id);
        if (!desc) {
            return res.status(404).json({ message: "Descriptive not found" });
        }

        // 🧹 Step 1: Delete any Cloudinary diagrams
        if (Array.isArray(desc.answer)) {
            for (const block of desc.answer) {
                if (block.type === "diagram" && block.content?.includes("res.cloudinary.com")) {
                    await deleteFromCloudinary(block.content);
                }
            }
        }

        // 🗑️ Step 2: Delete the descriptive question itself
        await desc.deleteOne();

        res.status(200).json({ message: "🗑️ Descriptive deleted and Cloudinary assets cleaned up" });
    } catch (error) {
        console.error("❌ Error deleting descriptive:", error);
        res.status(500).json({ message: error.message });
    }
};
