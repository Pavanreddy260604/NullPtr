import express from "express";
import {
    createMCQ,
    getMCQsByUnit,
    createFillBlank,
    createDescriptive,
    getFillBlanksByUnit,
    getDescriptivesByUnit,
    updateMCQById,
    updateFillBlankById,
    updateDescriptiveById,
    deleteMCQById,
    deleteFillBlankById,
    deleteDescriptiveById,
    bulkCreateMCQs,
    bulkCreateFillBlanks,
    bulkCreateDescriptives,
    bulkDeleteMcqs,
    bulkDeleteFillBlanks,
    bulkDeleteDescriptives,
} from "../controllers/questionController.js";

const router = express.Router();

// ⚠️ IMPORTANT: Bulk routes MUST come BEFORE /:id routes
// Otherwise Express matches "/mcq/bulk" to "/mcq/:id" (where :id = "bulk")

// CREATE (single)
router.post("/mcq", createMCQ);
router.post("/fillblank", createFillBlank);
router.post("/descriptive", createDescriptive);

// CREATE (bulk) - must come before /:id routes
router.post("/mcq/bulk", bulkCreateMCQs);
router.post("/fillblank/bulk", bulkCreateFillBlanks);
router.post("/descriptive/bulk", bulkCreateDescriptives);

// DELETE (bulk) - must come before /:id routes
router.delete("/mcq/bulk", bulkDeleteMcqs);
router.delete("/fillblank/bulk", bulkDeleteFillBlanks);
router.delete("/descriptive/bulk", bulkDeleteDescriptives);

// GET by unit
router.get("/mcq/unit/:unitId", getMCQsByUnit);
router.get("/fillblank/unit/:unitId", getFillBlanksByUnit);
router.get("/descriptive/unit/:unitId", getDescriptivesByUnit);

// UPDATE (single) - /:id routes come after /bulk routes
router.put("/mcq/:id", updateMCQById);
router.put("/fillblank/:id", updateFillBlankById);
router.put("/descriptive/:id", updateDescriptiveById);

// DELETE (single) - /:id routes come after /bulk routes
router.delete("/mcq/:id", deleteMCQById);
router.delete("/fillblank/:id", deleteFillBlankById);
router.delete("/descriptive/:id", deleteDescriptiveById);

export default router;
