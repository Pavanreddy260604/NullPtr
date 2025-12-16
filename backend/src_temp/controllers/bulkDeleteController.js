import mongoose from "mongoose";

export const bulkDeleteByUnit = (Model, label) => async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Expected a non-empty array of IDs" });
        }

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return res.status(400).json({ message: "No valid IDs provided" });
        }

        const result = await Model.deleteMany({
            _id: { $in: validIds }
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: `No ${label} were deleted`
            });
        }

        return res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} ${label}`,
            requested: ids.length,
            deleted: result.deletedCount
        });

    } catch (error) {
        console.error(`❌ bulkDelete ${label} error:`, error);
        return res.status(500).json({
            message: "Bulk delete failed. Please try again."
        });
    }
};
