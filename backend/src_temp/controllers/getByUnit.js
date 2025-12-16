import mongoose from "mongoose";
import Unit from "../models/Unit.js";

export const getByUnit = (Model, label, projection = {}) => async (req, res) => {
    try {
        const { unitId } = req.params;

        // 1️⃣ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(unitId)) {
            return res.status(400).json({ message: "Invalid unitId" });
        }

        // 2️⃣ Ensure unit exists
        const unitExists = await Unit.exists({ _id: unitId });
        if (!unitExists) {
            return res.status(404).json({ message: "Unit not found" });
        }

        // 3️⃣ Fetch data (sorted, projected)
        const data = await Model.find({ unitId }, projection)
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            count: data.length,
            data
        });

    } catch (error) {
        console.error(`❌ get ${label} by unit error:`, error);
        return res.status(500).json({
            message: `Failed to fetch ${label}. Please try again.`
        });
    }
};
