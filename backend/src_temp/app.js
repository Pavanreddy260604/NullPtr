import express from "express";
import cors from "cors";
import subjectRoutes from "./routes/subjectRouter.js";
import unitRoutes from "./routes/unitRouter.js";
import questionRoutes from "./routes/questionRouter.js";
import uploadRouter from "./controllers/uploadController.js";
import authRouter from "./routes/authRouter.js";
import progressRouter from "./routes/progressRouter.js";
import adminRouter from "./routes/adminRouter.js";
import quizRouter from "./routes/quizRouter.js";

const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-second-space-secret"]
}));
app.use(express.json());

app.get("/", (req, res) => res.send("🚀 API Running Successfully!"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Content routes — aligned with serverless function route patterns
app.use("/subjects", subjectRoutes);
app.use("/units", unitRoutes);
app.use("/", questionRoutes);              // Question routes: /mcq/..., /fillblank/..., /descriptive/...
app.use("/upload", uploadRouter);

// Auth & user routes
app.use("/auth", authRouter);

// Progress & spaced repetition routes
app.use("/progress", progressRouter);

// Admin routes
app.use("/admin", adminRouter);
app.use("/quiz", quizRouter);

import expressListEndpoints from "express-list-endpoints";
console.log(expressListEndpoints(app));

export default app;
