import mongoose from "mongoose";
import Unit from "../models/Unit.js";

export const bulkCreateByUnit = (
    Model,
    unitField,
    label,
    prepare = (q, refImages) => q
) => async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let items = req.body[label.toLowerCase()] || req.body;
        const { unitId, subjectId, refImages = {} } = req.body;

        if (!unitId || !subjectId) {
            return res.status(400).json({ message: "unitId and subjectId are required" });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: `Expected an array of ${label}` });
        }

        if (
            !mongoose.Types.ObjectId.isValid(unitId) ||
            !mongoose.Types.ObjectId.isValid(subjectId)
        ) {
            return res.status(400).json({ message: "Invalid unitId or subjectId" });
        }

        session.startTransaction();

        const unit = await Unit.findById(unitId).session(session);
        if (!unit) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Unit not found" });
        }

        // Pass refImages to prepare function for image reference resolution
        const prepared = items.map((q) =>
            prepare({ ...q, unitId, subjectId }, refImages)
        );

        const created = await Model.insertMany(prepared, {
            session,
            ordered: true, // consistent behavior
        });

        await Unit.updateOne(
            { _id: unitId },
            { $push: { [unitField]: { $each: created.map((d) => d._id) } } },
            { session }
        );

        await session.commitTransaction();

        return res.status(201).json({
            message: `Successfully created ${created.length} ${label}`,
            createdCount: created.length,
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(`❌ bulkCreate ${label} error:`, error);

        return res.status(500).json({
            message: `Failed to bulk create ${label}. Please try again.`,
        });
    } finally {
        session.endSession();
    }
};
