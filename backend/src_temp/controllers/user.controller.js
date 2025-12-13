import Unit from "../models/Unit.js";
import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";

export const createUnit = async (req, res) => {
    try {
        const unit = await Unit.create(req.body);
        res.status(201).json({ message: "✅ Unit created", unit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUnitsBySubject = async (req, res) => {
    try {
        const units = await Unit.find({ subjectId: req.params.subjectId });
        res.json(units);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id)
            .populate("mcqs")
            .populate("fillBlanks")
            .populate("descriptive");
        if (!unit) return res.status(404).json({ message: "Unit not found" });
        res.json(unit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUnit = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "✅ Unit updated", unit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) return res.status(404).json({ message: "Unit not found" });

        await MCQ.deleteMany({ unitId: unit._id });
        await FillBlank.deleteMany({ unitId: unit._id });
        await Descriptive.deleteMany({ unitId: unit._id });

        await unit.deleteOne();

        res.json({ message: "🗑️ Unit and all questions deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
