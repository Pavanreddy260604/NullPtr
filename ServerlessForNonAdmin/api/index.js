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
    // CORS Headers for cross-origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-second-space-secret");

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Only GET allowed" });
    }

    try {
        await connectDB();

        // Safe URL Parsing: Splits path and removes empty strings
        // e.g., "/api/units/subject/123" -> ["api", "units", "subject", "123"]
        const parts = req.url.split("?")[0].split("/").filter(Boolean);

        // Debug logging
        console.log("Request URL:", req.url);
        console.log("Parsed parts:", parts);

        // Locate 'api' to anchor our logic, or assume structure if 'api' is missing
        const apiIndex = parts.indexOf("api");
        const rootIndex = apiIndex === -1 ? 0 : apiIndex + 1; // Start looking after 'api'

        const resource = parts[rootIndex];       // e.g., "subjects"
        const subResource = parts[rootIndex + 1]; // e.g., "subject" OR specific ID
        const param = parts[rootIndex + 2];       // e.g., ID if subResource was "subject"

        console.log("Routing -> resource:", resource, "subResource:", subResource, "param:", param);

        const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);
        let data = null;

        // Collection name mapping (API resource -> MongoDB collection)
        // Mongoose auto-pluralizes: MCQ -> mcqs, FillBlank -> fillblanks, Descriptive -> descriptives
        const collectionMap = {
            mcq: "mcqs",
            fillblank: "fillblanks",
            descriptive: "descriptives", // FIXED: Was "descriptive", should be "descriptives"
        };

        /* --- ROUTING --- */

        // 1. SUBJECTS ROUTES
        if (resource === "subjects") {
            if (!subResource) {
                // List all subjects
                console.log("Fetching all subjects...");

                const secret = req.headers['x-second-space-secret'];
                const SERVER_SECRET = process.env.SECOND_SPACE_SECRET || 'nullptr_secret_123';

                let query = {};
                // Filter if missing secret
                if (secret !== SERVER_SECRET) {
                    query = {
                        $or: [
                            { visibility: 'public' },
                            { visibility: { $exists: false } }, // Legacy docs
                            { visibility: null }
                        ]
                    };
                }

                data = await getModel("subjects").find(query).lean();
            } else if (isValidId(subResource)) {
                // Get single subject by ID
                console.log("Fetching subject by ID:", subResource);
                data = await getModel("subjects").findById(subResource).lean();
            }
        }

        // 2. UNITS ROUTES
        else if (resource === "units") {
            if (subResource === "subject" && isValidId(param)) {
                // Get units by Subject ID
                console.log("Fetching units for subject:", param);
                data = await getModel("units").find({ subjectId: new mongoose.Types.ObjectId(param) }).lean();
            } else if (isValidId(subResource)) {
                // Get single unit by ID
                console.log("Fetching unit by ID:", subResource);
                data = await getModel("units").findById(subResource).lean();
            }
        }

        // 3. QUESTIONS ROUTES (MCQ, FillBlank, Descriptive)
        else if (collectionMap[resource]) {
            const collectionName = collectionMap[resource];

            if (subResource === "unit" && isValidId(param)) {
                console.log("Fetching", collectionName, "for unit:", param);
                data = await getModel(collectionName).find({ unitId: new mongoose.Types.ObjectId(param) }).lean();
            } else if (isValidId(subResource)) {
                console.log("Fetching", collectionName, "by ID:", subResource);
                data = await getModel(collectionName).findById(subResource).lean();
            }
        }

        // 4. Fallback
        if (data === null || data === undefined) {
            console.log("404 - No data found for route");
            return res.status(404).json({
                message: "Resource not found or invalid ID",
                debug: { resource, subResource, param }
            });
        }

        console.log("Success - returning", Array.isArray(data) ? data.length + " items" : "1 item");

        /* --- CACHING & RESPONSE --- */
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        return res.status(200).json(data);

    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}