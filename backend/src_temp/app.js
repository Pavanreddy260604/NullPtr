import express from "express";
import cors from "cors";
import subjectRoutes from "./routes/subjectRouter.js";
import unitRoutes from "./routes/unitRouter.js";
import questionRoutes from "./routes/questionRouter.js";
import uploadRouter from "./controllers/uploadController.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🚀 API Running Successfully!"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/subject", subjectRoutes);
app.use("/unit", unitRoutes);
app.use("/question", questionRoutes);
app.use("/upload", uploadRouter);

import expressListEndpoints from "express-list-endpoints";
console.log(expressListEndpoints(app));

export default app;
