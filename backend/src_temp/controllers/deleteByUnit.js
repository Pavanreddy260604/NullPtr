import mongoose from "mongoose";
import Unit from "../models/Unit.js";

export const deleteByIdAndUnit = (
    Model,
    unitField,
    label,
    beforeDelete = async () => { }
) => async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;
        // unitId can come from body or query params
        const unitId = req.body?.unitId || req.query?.unitId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        session.startTransaction();

        // Find the document first (with or without unitId filter)
        const query = { _id: id };
        if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
            query.unitId = unitId;
        }

        const doc = await Model.findOne(query).session(session);
        if (!doc) {
            await session.abortTransaction();
            return res.status(404).json({ message: `${label} not found` });
        }

        // Use the document's unitId for the unit update
        const docUnitId = doc.unitId;

        // DB delete
        await Model.deleteOne({ _id: id }).session(session);

        // Update the unit to remove the reference
        if (docUnitId) {
            await Unit.updateOne(
                { _id: docUnitId },
                { $pull: { [unitField]: id } },
                { session }
            );
        }

        await session.commitTransaction();

        // 🔥 External cleanup AFTER commit
        await beforeDelete(doc);

        return res.status(200).json({
            message: `${label} deleted successfully`
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(`❌ delete ${label} error:`, error);

        return res.status(500).json({
            message: `Failed to delete ${label}. Please try again.`
        });
    } finally {
        session.endSession();
    }
};
