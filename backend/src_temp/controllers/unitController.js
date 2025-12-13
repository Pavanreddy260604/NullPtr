import mongoose from "mongoose";
import Unit from "../models/Unit.js";
import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";
import Subject from "../models/Subject.js"; // ✅ make sure Subject model is imported

// ✅ Create Unit with error logging and subject validation

export const createUnit = async (req, res) => {
    try {
        console.log("🟢 Incoming request body:", req.body);

        const { subjectId, title, unit, subtitle } = req.body;

        // ✅ Validation
        if (!subjectId || !title || !unit) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // ✅ Ensure subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // ✅ Create new unit document
        const newUnit = await Unit.create({
            subjectId,
            title,
            subtitle: subtitle || "",
            unit: Number(unit),
        });

        // ✅ Push unit reference into subject
        subject.units.push(newUnit._id);
        await subject.save();

        console.log("✅ Unit linked to subject:", subject.name);

        res.status(201).json({
            message: "✅ Unit created and linked to subject successfully!",
            unit: newUnit,
        });
    } catch (err) {
        console.error("❌ Error creating unit:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Get all units for a subject
export const getUnitsBySubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId)
            .populate("units"); // ✅ Populate the linked units

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        res.json(subject.units); // ✅ Send back the populated unit array
    } catch (err) {
        console.error("❌ Error fetching units by subject:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Get single unit by ID (with all question types populated)
export const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id)
            .populate("mcqs")
            .populate("fillBlanks")
            .populate("descriptive");

        if (!unit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        res.json(unit);
    } catch (err) {
        console.error("❌ Error fetching unit by ID:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Update Unit
export const updateUnit = async (req, res) => {
    try {
        const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.json({ message: "✅ Unit updated", unit: updatedUnit });
    } catch (err) {
        console.error("❌ Error updating unit:", err);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Delete Unit and related questions


export const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) return res.status(404).json({ message: "Unit not found" });

        // ✅ Delete related questions
        await MCQ.deleteMany({ unitId: unit._id });
        await FillBlank.deleteMany({ unitId: unit._id });
        await Descriptive.deleteMany({ unitId: unit._id });

        // ✅ Remove unit reference from Subject
        await Subject.findByIdAndUpdate(
            unit.subjectId,
            { $pull: { units: unit._id } }, // removes unit id from subject’s array
            { new: true }
        );

        // ✅ Finally, delete the unit itself
        await unit.deleteOne();

        res.json({ message: "🗑️ Unit and all related questions removed successfully!" });
    } catch (err) {
        console.error("❌ Error deleting unit:", err);
        res.status(500).json({ message: err.message });
    }
};

