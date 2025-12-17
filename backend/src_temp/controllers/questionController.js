import mongoose from "mongoose";

import MCQ from "../models/MCQ.js";
import FillBlank from "../models/FillBlank.js";
import Descriptive from "../models/Descriptive.js";
import Unit from "../models/Unit.js";

import { deleteFromCloudinary } from "../utils/cloudinaryCleanup.js";

// 🔁 Generic helpers
import { createByUnit } from "./createController.js";
import { getByUnit } from "./getByUnit.js";
import { updateByIdAndUnit } from "./updateController.js";
import { deleteByIdAndUnit } from "./deleteByUnit.js";
import { bulkCreateByUnit } from "./bulkcreateController.js";
import { bulkDeleteByUnit } from "./bulkDeleteController.js";
import { resolveImageRefs } from "./resolveImageRefs.js";

/* -------------------------------------------------------------------------- */
/*                            🧠 CREATE OPERATIONS                            */
/* -------------------------------------------------------------------------- */

export const createMCQ = createByUnit(MCQ, "mcqs", "MCQ");

export const createFillBlank = createByUnit(
    FillBlank,
    "fillBlanks",
    "FillBlank"
);

export const createDescriptive = createByUnit(
    Descriptive,
    "descriptive",
    "Descriptive"
);

/* -------------------------------------------------------------------------- */
/*                              📚 GET OPERATIONS                             */
/* -------------------------------------------------------------------------- */

export const getMCQsByUnit = getByUnit(
    MCQ,
    "MCQs",
    { question: 1, options: 1, correctAnswer: 1, topic: 1 }
);

export const getFillBlanksByUnit = getByUnit(
    FillBlank,
    "FillBlanks",
    { question: 1, correctAnswer: 1, topic: 1 }
);

export const getDescriptivesByUnit = getByUnit(
    Descriptive,
    "Descriptives",
    { question: 1, answer: 1, topic: 1 }
);

/* -------------------------------------------------------------------------- */
/*                             ✏️ UPDATE OPERATIONS                           */
/* -------------------------------------------------------------------------- */

export const updateMCQById = updateByIdAndUnit(
    MCQ,
    "MCQ",
    ["question", "options", "correctAnswer", "topic"]
);

export const updateFillBlankById = updateByIdAndUnit(
    FillBlank,
    "FillBlank",
    ["question", "correctAnswer", "topic"]
);

export const updateDescriptiveById = updateByIdAndUnit(
    Descriptive,
    "Descriptive",
    ["question", "answer", "topic"]
);

/* -------------------------------------------------------------------------- */
/*                             ❌ DELETE OPERATIONS                           */
/* -------------------------------------------------------------------------- */

export const deleteMCQById = deleteByIdAndUnit(
    MCQ,
    "mcqs",
    "MCQ"
);

export const deleteFillBlankById = deleteByIdAndUnit(
    FillBlank,
    "fillBlanks",
    "FillBlank"
);

export const deleteDescriptiveById = deleteByIdAndUnit(
    Descriptive,
    "descriptive",
    "Descriptive",
    async (desc) => {
        if (Array.isArray(desc.answer)) {
            for (const block of desc.answer) {
                if (
                    block.type === "diagram" &&
                    typeof block.content === "string" &&
                    block.content.includes("res.cloudinary.com")
                ) {
                    await deleteFromCloudinary(block.content);
                }
            }
        }
    }
);

/* -------------------------------------------------------------------------- */
/*                           📦 BULK CREATE OPERATIONS                        */
/* -------------------------------------------------------------------------- */

export const bulkCreateMCQs = bulkCreateByUnit(
    MCQ,
    "mcqs",
    "MCQs",
    (q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        unitId: q.unitId,
        subjectId: q.subjectId,
    })
);

export const bulkCreateFillBlanks = bulkCreateByUnit(
    FillBlank,
    "fillBlanks",
    "FillBlanks",
    (q) => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        unitId: q.unitId,
        subjectId: q.subjectId,
    })
);

export const bulkCreateDescriptives = bulkCreateByUnit(
    Descriptive,
    "descriptive",
    "Descriptives",
    (q, refImages) => resolveImageRefs(q, refImages)
);

/* -------------------------------------------------------------------------- */
/*                           🧹 BULK DELETE OPERATIONS                        */
/* -------------------------------------------------------------------------- */

export const bulkDeleteMcqs = bulkDeleteByUnit(MCQ, "MCQs", "mcqs");

export const bulkDeleteFillBlanks = bulkDeleteByUnit(
    FillBlank,
    "FillBlanks",
    "fillBlanks"
);

export const bulkDeleteDescriptives = bulkDeleteByUnit(
    Descriptive,
    "Descriptives",
    "descriptive"
);
