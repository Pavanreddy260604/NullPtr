import mongoose from "mongoose";
import Unit from "../models/Unit.js";

/**
 * Bulk delete with Unit reference cleanup
 * @param Model - Mongoose model (MCQ, FillBlank, Descriptive)
 * @param label - Display label for messages
 * @param unitField - Field name in Unit schema (mcqs, fillBlanks, descriptive)
 */
export const bulkDeleteByUnit = (Model, label, unitField) => async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Expected a non-empty array of IDs" });
        }

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "No valid IDs provided" });
        }

        session.startTransaction();

        // Convert to ObjectIds for both operations
        const objectIds = validIds.map(id => new mongoose.Types.ObjectId(id));

        // Delete the documents
        const result = await Model.deleteMany({
            _id: { $in: objectIds }
        }).session(session);

        if (result.deletedCount === 0) {
            await session.abortTransaction();
            return res.status(404).json({
                message: `No ${label} were deleted`
            });
        }

        // Remove references from all Units that contain these IDs
        if (unitField) {
            await Unit.updateMany(
                { [unitField]: { $in: objectIds } },
                { $pull: { [unitField]: { $in: objectIds } } },
                { session }
            );
        }

        await session.commitTransaction();

        return res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} ${label}`,
            requested: ids.length,
            deleted: result.deletedCount
        });

    } catch (error) {
        await session.abortTransaction();
        console.error(`❌ bulkDelete ${label} error:`, error);
        return res.status(500).json({
            message: "Bulk delete failed. Please try again."
        });
    } finally {
        session.endSession();
    }
};
