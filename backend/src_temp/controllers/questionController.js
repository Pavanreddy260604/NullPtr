import mongoose from "mongoose";
import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";
import Unit from "../models/Unit.js";
import { deleteFromCloudinary } from "../utils/cloudinaryCleanup.js";


/**
 * 🧩 Validate MongoDB IDs
 */
const validateIds = (res, unitId, subjectId) => {
    if (!unitId || !subjectId) {
        res.status(400).json({ message: "unitId and subjectId are required" });
        return false;
    }
    if (
        !mongoose.Types.ObjectId.isValid(unitId) ||
        !mongoose.Types.ObjectId.isValid(subjectId)
    ) {
        res.status(400).json({ message: "Invalid unitId or subjectId format" });
        return false;
    }
    return true;
};

/* -------------------------------------------------------------------------- */
/*                            🧠 CREATE OPERATIONS                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              📚 GET OPERATIONS                             */
/* -------------------------------------------------------------------------- */

export const getMCQsByUnit = async (req, res) => {
    try {
        const mcqs = await MCQ.find({ unitId: req.params.unitId });
        res.status(200).json(mcqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFillBlanksByUnit = async (req, res) => {
    try {
        const fillBlanks = await FillBlank.find({ unitId: req.params.unitId });
        res.status(200).json(fillBlanks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDescriptivesByUnit = async (req, res) => {
    try {
        const descriptives = await Descriptive.find({ unitId: req.params.unitId });
        res.status(200).json(descriptives);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* -------------------------------------------------------------------------- */
/*                             ✏️ UPDATE OPERATIONS                           */
/* -------------------------------------------------------------------------- */

export const updateMCQById = async (req, res) => {
    try {
        const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mcq) return res.status(404).json({ message: "MCQ not found" });
        res.status(200).json({ message: "✅ MCQ updated successfully", mcq });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateFillBlankById = async (req, res) => {
    try {
        const fb = await FillBlank.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fb) return res.status(404).json({ message: "FillBlank not found" });
        res.status(200).json({ message: "✅ FillBlank updated successfully", fb });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDescriptiveById = async (req, res) => {
    try {
        const desc = await Descriptive.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!desc) return res.status(404).json({ message: "Descriptive not found" });
        res.status(200).json({ message: "✅ Descriptive updated successfully", desc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* -------------------------------------------------------------------------- */
/*                             ❌ DELETE OPERATIONS                           */
/* -------------------------------------------------------------------------- */

export const deleteMCQById = async (req, res) => {
    try {
        const mcq = await MCQ.findByIdAndDelete(req.params.id);
        if (!mcq) return res.status(404).json({ message: "MCQ not found" });

        await Unit.findByIdAndUpdate(mcq.unitId, { $pull: { mcqs: mcq._id } });
        res.status(200).json({ message: "🗑️ MCQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteFillBlankById = async (req, res) => {
    try {
        const fb = await FillBlank.findByIdAndDelete(req.params.id);
        if (!fb) return res.status(404).json({ message: "FillBlank not found" });

        await Unit.findByIdAndUpdate(fb.unitId, { $pull: { fillBlanks: fb._id } });
        res.status(200).json({ message: "🗑️ FillBlank deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDescriptiveById = async (req, res) => {
    try {
        const desc = await Descriptive.findById(req.params.id);
        if (!desc) return res.status(404).json({ message: "Descriptive not found" });

        // 🧹 Step 1: Delete Cloudinary diagrams if present
        if (Array.isArray(desc.answer)) {
            for (const block of desc.answer) {
                if (block.type === "diagram" && block.content?.includes("res.cloudinary.com")) {
                    await deleteFromCloudinary(block.content);
                }
            }
        }

        // 🧹 Step 2: Remove reference from Unit
        await Unit.findByIdAndUpdate(desc.unitId, { $pull: { descriptive: desc._id } });

        // 🗑️ Step 3: Delete the question
        await desc.deleteOne();

        res.status(200).json({ message: "🗑️ Descriptive deleted and Cloudinary assets cleaned up" });
    } catch (error) {
        console.error("❌ Error deleting descriptive:", error);
        res.status(500).json({ message: error.message });
    }
};

export const bulkCreateMCQs = async (req, res) => {
    try {
        let mcqs = req.body;

        // 🧩 Support both array or wrapped object
        if (req.body.mcqs && Array.isArray(req.body.mcqs)) {
            mcqs = req.body.mcqs;
        }

        // 🧩 Get fallback IDs (priority: body → query)
        const defaultUnitId = req.body.unitId || req.query.unitId;
        const defaultSubjectId = req.body.subjectId || req.query.subjectId;

        if (!defaultUnitId || !defaultSubjectId) {
            return res.status(400).json({ message: "unitId and subjectId are required" });
        }

        if (!Array.isArray(mcqs) || mcqs.length === 0) {
            return res.status(400).json({ message: "Expected an array of MCQs" });
        }

        // ✅ Inject fallback IDs into each question
        const preparedMCQs = mcqs.map((q) => ({
            ...q,
            unitId: q.unitId || defaultUnitId,
            subjectId: q.subjectId || defaultSubjectId,
        }));

        // ✅ Validate all IDs
        for (const q of preparedMCQs) {
            if (!mongoose.Types.ObjectId.isValid(q.unitId) || !mongoose.Types.ObjectId.isValid(q.subjectId)) {
                return res.status(400).json({ message: "Invalid ObjectId format detected" });
            }
        }

        // ✅ Bulk insert
        const created = await MCQ.insertMany(preparedMCQs);

        // ✅ Link them to their Unit
        await Unit.findByIdAndUpdate(defaultUnitId, {
            $push: { mcqs: { $each: created.map((q) => q._id) } },
        });

        res.status(201).json({
            message: `✅ Successfully created ${created.length} MCQs`,
            createdCount: created.length,
        });
    } catch (error) {
        console.error("❌ bulkCreateMCQs error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const bulkCreateFillBlanks = async (req, res) => {
    try {
        let fillBlanks = req.body;

        // 🧩 Support both array or wrapped object
        if (req.body.fillBlanks && Array.isArray(req.body.fillBlanks)) {
            fillBlanks = req.body.fillBlanks;
        }

        // 🧩 Get fallback IDs (priority: body → query)
        const defaultUnitId = req.body.unitId || req.query.unitId;
        const defaultSubjectId = req.body.subjectId || req.query.subjectId;

        if (!defaultUnitId || !defaultSubjectId) {
            return res.status(400).json({ message: "unitId and subjectId are required" });
        }

        // ✅ Validate ID formats
        if (
            !mongoose.Types.ObjectId.isValid(defaultUnitId) ||
            !mongoose.Types.ObjectId.isValid(defaultSubjectId)
        ) {
            return res.status(400).json({ message: "Invalid unitId or subjectId format" });
        }

        // ✅ Ensure data is an array
        if (!Array.isArray(fillBlanks) || fillBlanks.length === 0) {
            return res.status(400).json({ message: "Expected an array of FillBlank questions" });
        }

        // ✅ Verify Unit exists
        const unitExists = await Unit.findById(defaultUnitId);
        if (!unitExists) {
            return res.status(404).json({ message: "Unit not found" });
        }

        // ✅ Inject fallback IDs into each question
        const preparedFillBlanks = fillBlanks.map((q) => ({
            ...q,
            unitId: q.unitId || defaultUnitId,
            subjectId: q.subjectId || defaultSubjectId,
        }));

        // ✅ Validate each question structure
        const invalid = preparedFillBlanks.find(
            (q) => !q.question || typeof q.correctAnswer !== "string"
        );
        if (invalid) {
            return res.status(400).json({
                message: "Each FillBlank must include 'question' and 'correctAnswer' (string).",
            });
        }

        // ✅ Bulk insert (ordered: false → continues even if one fails)
        const created = await FillBlank.insertMany(preparedFillBlanks, { ordered: false });

        // ✅ Link them to their Unit
        await Unit.findByIdAndUpdate(defaultUnitId, {
            $push: { fillBlanks: { $each: created.map((q) => q._id) } },
        });

        res.status(201).json({
            message: `✅ Successfully created ${created.length} Fill-in-the-Blank questions`,
            createdCount: created.length,
        });
    } catch (error) {
        console.error("❌ bulkCreateFillBlanks error:", error);
        res.status(500).json({ message: error.message });
    }
};

const resolveImageRefs = (question, refImages = {}) => {
    if (!question.answer || !Array.isArray(question.answer)) return question;

    question.answer.forEach((block) => {
        if (block.type === "diagram") {
            // Case 1️⃣ — if reference exists and matches a refImages entry
            if (block.ref && refImages[block.ref]) {
                block.content = refImages[block.ref];
            }
            // Case 2️⃣ — if direct Cloudinary URL already exists
            else if (typeof block.content === "string" && block.content.startsWith("https://res.cloudinary.com")) {
                // keep it as is
            }
            // Case 3️⃣ — fallback empty (no image found)
            else {
                block.content = "";
            }
        }
    });

    return question;
};

/**
 * ✅ Bulk Create Descriptive Questions
 * POST /question/descriptive/bulk
 */
export const bulkCreateDescriptives = async (req, res) => {
    try {
        let descriptives = req.body.descriptives || req.body;
        const { unitId, subjectId, refImages = {} } = req.body;

        // 🧩 Validate IDs
        if (!unitId || !subjectId) {
            return res.status(400).json({ message: "unitId and subjectId are required" });
        }
        if (!Array.isArray(descriptives) || descriptives.length === 0) {
            return res.status(400).json({ message: "Expected an array of descriptive questions" });
        }
        if (!mongoose.Types.ObjectId.isValid(unitId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: "Invalid unitId or subjectId" });
        }

        // 🧠 Prepare and inject Cloudinary URLs
        const prepared = descriptives.map((q) => ({
            ...resolveImageRefs(q, refImages),
            unitId,
            subjectId,
        }));

        // 💾 Insert all at once
        const created = await Descriptive.insertMany(prepared);

        // 🔗 Link to Unit collection
        await Unit.findByIdAndUpdate(unitId, {
            $push: { descriptive: { $each: created.map((q) => q._id) } },
        });

        res.status(201).json({
            message: `✅ Successfully created ${created.length} descriptive questions`,
            createdCount: created.length,
        });
    } catch (error) {
        console.error("❌ bulkCreateDescriptives error:", error);
        res.status(500).json({ message: error.message });
    }
};