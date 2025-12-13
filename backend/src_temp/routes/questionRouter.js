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
    deleteDescriptiveById
} from "../controllers/questionController.js";

const router = express.Router();

router.post("/mcq", createMCQ);
router.post("/fillblank", createFillBlank);
router.post("/descriptive", createDescriptive);
router.get("/mcq/unit/:unitId", getMCQsByUnit);
router.get("/fillblank/unit/:unitId", getFillBlanksByUnit);
router.get("/descriptive/unit/:unitId", getDescriptivesByUnit);
router.put("/mcq/:id", updateMCQById);
router.put("/fillblank/:id", updateFillBlankById);
router.put("/descriptive/:id", updateDescriptiveById);
router.delete("/mcq/:id", deleteMCQById);
router.delete("/fillblank/:id", deleteFillBlankById);
router.delete("/descriptive/:id", deleteDescriptiveById);
export default router;
