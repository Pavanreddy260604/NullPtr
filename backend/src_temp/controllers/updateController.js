import mongoose from "mongoose";

export const updateByIdAndUnit = (Model, label, allowedFields) => async (req, res) => {
    try {
        const { id } = req.params;
        const unitId = req.body?.unitId;

        // 1️⃣ Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        // 2️⃣ Whitelist fields
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        // 3️⃣ Build query - unitId is optional for scoping
        const query = { _id: id };
        if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
            query.unitId = unitId;
        }

        // 4️⃣ Update with validators
        const doc = await Model.findOneAndUpdate(
            query,
            updateData,
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({ message: `${label} not found` });
        }

        return res.status(200).json({
            message: `${label} updated successfully`,
            data: doc
        });

    } catch (error) {
        console.error(`❌ update ${label} error:`, error);
        return res.status(500).json({
            message: `Failed to update ${label}. Please try again.`
        });
    }
};
