import mongoose from "mongoose";

/* -------------------------------------------------- */
/* 🔌 Mongo Connection (cached for cold starts)       */
/* -------------------------------------------------- */
let cached = global.mongoose;

async function connectDB() {
    if (cached) return cached;

    cached = global.mongoose = await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
    });

    return cached;
}

/* -------------------------------------------------- */
/* 🧠 Generic Schemas (flexible, no strict models)    */
/* -------------------------------------------------- */
const getModel = (name) =>
    mongoose.models[name] ||
    mongoose.model(
        name,
        new mongoose.Schema({}, { strict: false, collection: name })
    );

/* -------------------------------------------------- */
/* 🚀 MAIN HANDLER                                    */
/* -------------------------------------------------- */
export default async function handler(req, res) {
    const { method, url } = req;

    if (method !== "GET") {
        return res.status(405).json({ message: "Only GET allowed" });
    }

    await connectDB();

    const path = url.split("?")[0];

    try {
        let data;

        /* ---------------- SUBJECTS ---------------- */
        if (path === "/api/subjects") {
            data = await getModel("subjects").find();
        }

        else if (path.startsWith("/api/subjects/")) {
            const id = path.split("/")[3];
            data = await getModel("subjects").findById(id);
        }

        /* ---------------- UNITS ---------------- */
        else if (path.startsWith("/api/units/subject/")) {
            const subjectId = path.split("/")[4];
            data = await getModel("units").find({ subjectId });
        }

        else if (path.startsWith("/api/units/")) {
            const id = path.split("/")[3];
            data = await getModel("units").findById(id);
        }

        /* ---------------- QUESTIONS ---------------- */
        else if (path.startsWith("/api/mcq/unit/")) {
            const unitId = path.split("/")[4];
            data = await getModel("mcqs").find({ unitId });
        }

        else if (path.startsWith("/api/fillblank/unit/")) {
            const unitId = path.split("/")[4];
            data = await getModel("fillblanks").find({ unitId });
        }

        else if (path.startsWith("/api/descriptive/unit/")) {
            const unitId = path.split("/")[4];
            data = await getModel("descriptives").find({ unitId });
        }

        else {
            return res.status(404).json({ message: "Route not found" });
        }

        /* -------------------------------------------------- */
        /* ⚡ CDN CACHE (Vercel)                              */
        /* -------------------------------------------------- */
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=60, stale-while-revalidate=300"
        );

        return res.json(data);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
