/**
 * Cleanup Script: Remove all orphan references from Units
 * Run with: node scripts/cleanupOrphans.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function cleanup() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected!\n");

        const db = mongoose.connection.db;

        // Get all existing question IDs
        console.log("📊 Fetching existing question IDs...");

        const mcqIds = (await db.collection("mcqs").find({}, { projection: { _id: 1 } }).toArray())
            .map(d => d._id.toString());
        console.log(`   MCQs: ${mcqIds.length}`);

        const fillBlankIds = (await db.collection("fillblanks").find({}, { projection: { _id: 1 } }).toArray())
            .map(d => d._id.toString());
        console.log(`   FillBlanks: ${fillBlankIds.length}`);

        const descriptiveIds = (await db.collection("descriptives").find({}, { projection: { _id: 1 } }).toArray())
            .map(d => d._id.toString());
        console.log(`   Descriptives: ${descriptiveIds.length}`);

        // Get all units
        const units = await db.collection("units").find({}).toArray();
        console.log(`\n📦 Processing ${units.length} units...\n`);

        let totalOrphans = 0;

        for (const unit of units) {
            let orphansInUnit = 0;
            const updates = {};

            // Check MCQs
            if (Array.isArray(unit.mcqs)) {
                const validMcqs = unit.mcqs.filter(id => mcqIds.includes(id.toString()));
                if (validMcqs.length !== unit.mcqs.length) {
                    orphansInUnit += unit.mcqs.length - validMcqs.length;
                    updates.mcqs = validMcqs;
                }
            }

            // Check FillBlanks
            if (Array.isArray(unit.fillBlanks)) {
                const validFillBlanks = unit.fillBlanks.filter(id => fillBlankIds.includes(id.toString()));
                if (validFillBlanks.length !== unit.fillBlanks.length) {
                    orphansInUnit += unit.fillBlanks.length - validFillBlanks.length;
                    updates.fillBlanks = validFillBlanks;
                }
            }

            // Check Descriptives
            if (Array.isArray(unit.descriptive)) {
                const validDescriptives = unit.descriptive.filter(id => descriptiveIds.includes(id.toString()));
                if (validDescriptives.length !== unit.descriptive.length) {
                    orphansInUnit += unit.descriptive.length - validDescriptives.length;
                    updates.descriptive = validDescriptives;
                }
            }

            // Update unit if there are orphans
            if (Object.keys(updates).length > 0) {
                await db.collection("units").updateOne(
                    { _id: unit._id },
                    { $set: updates }
                );
                console.log(`   🧹 Unit "${unit.title}": Removed ${orphansInUnit} orphan reference(s)`);
                totalOrphans += orphansInUnit;
            }
        }

        console.log(`\n✨ Cleanup complete! Total orphans removed: ${totalOrphans}`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    }
}

cleanup();
