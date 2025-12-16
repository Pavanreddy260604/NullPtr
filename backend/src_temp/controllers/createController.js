import mongoose from "mongoose";
import Unit from "../models/Unit.js";

export const createByUnit = (Model, unitField, label) => async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { unitId, subjectId } = req.body;

        // Validate required IDs
        if (!unitId || !subjectId) {
            return res.status(400).json({ message: "unitId and subjectId are required" });
        }

        if (!mongoose.Types.ObjectId.isValid(unitId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: "Invalid unitId or subjectId" });
        }

        session.startTransaction();

        // Ensure unit exists
        const unit = await Unit.findById(unitId).session(session);
        if (!unit) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Unit not found" });
        }

        // Create document
        const [doc] = await Model.create(
            [{ ...req.body, unitId, subjectId }],
            { session }
        );

        // Maintain reference
        await Unit.updateOne(
            { _id: unitId },
            { $push: { [unitField]: doc._id } },
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            message: `${label} created successfully`,
            data: doc
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(`❌ create ${label} error:`, error);

        return res.status(500).json({
            message: `Failed to create ${label}. Please try again.`
        });

    } finally {
        session.endSession();
    }
};
