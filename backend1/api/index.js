import mongoose from "mongoose";

/* -------------------------------------------------- */
/* 🔌 1. DB Connection (Fixed for Race Conditions)    */
/* -------------------------------------------------- */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = { bufferCommands: false, maxPoolSize: 10 };
        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

/* -------------------------------------------------- */
/* 🧠 2. Dynamic Model Factory                        */
/* -------------------------------------------------- */
const getModel = (name) =>
    mongoose.models[name] ||
    mongoose.model(
        name,
        new mongoose.Schema({}, { strict: false, collection: name })
    );

/* -------------------------------------------------- */
/* 🚀 3. Monolithic Handler                           */
/* -------------------------------------------------- */
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Only GET allowed" });
    }

    try {
        await connectDB();

        // Safe URL Parsing: Splits path and removes empty strings
        // e.g., "/api/units/subject/123" -> ["api", "units", "subject", "123"]
        const parts = req.url.split("?")[0].split("/").filter(Boolean);

        // Locate 'api' to anchor our logic, or assume structure if 'api' is missing
        const apiIndex = parts.indexOf("api");
        const rootIndex = apiIndex === -1 ? 0 : apiIndex + 1; // Start looking after 'api'

        const resource = parts[rootIndex];       // e.g., "subjects"
        const subResource = parts[rootIndex + 1]; // e.g., "subject" OR specific ID
        const param = parts[rootIndex + 2];       // e.g., ID if subResource was "subject"

        const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
        let data = null;

        /* --- ROUTING --- */

        // 1. SUBJECTS ROUTES
        if (resource === "subjects") {
            if (!subResource) {
                // List all subjects (Limited to 50 for safety)
                data = await getModel("subjects").find().limit(50);
            } else if (isValidId(subResource)) {
                // Get single subject by ID
                data = await getModel("subjects").findById(subResource);
            }
        }

        // 2. UNITS ROUTES
        else if (resource === "units") {
            if (subResource === "subject" && isValidId(param)) {
                // Get units by Subject ID
                data = await getModel("units").find({ subjectId: param });
            } else if (isValidId(subResource)) {
                // Get single unit by ID
                data = await getModel("units").findById(subResource);
            }
        }

        // 3. QUESTIONS ROUTES (MCQ, FillBlank, Descriptive)
        else if (["mcq", "fillblank", "descriptive"].includes(resource)) {
            const collectionName = resource + "s"; // Pluralize: mcqs, fillblanks...

            if (subResource === "unit" && isValidId(param)) {
                data = await getModel(collectionName).find({ unitId: param });
            }
        }

        // 4. Fallback
        if (!data) {
            return res.status(404).json({ message: "Resource not found or invalid ID" });
        }

        /* --- CACHING & RESPONSE --- */
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        return res.status(200).json(data);

    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}