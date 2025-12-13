import express from "express";
import {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubjectById,
    deleteSubjectById
} from "../controllers/subjectController.js";

const router = express.Router();

// ✅ CRUD endpoints for Subject
router.post("/", createSubject);
router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubjectById);
router.delete("/:id", deleteSubjectById);

export default router;
