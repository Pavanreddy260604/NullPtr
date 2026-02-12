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
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-second-space-secret");

    if (req.method === "OPTIONS") return res.status(204).end();

    try {
        await connectDB();

        // 1. URL PARSING & ROUTE NORMALIZATION
        const parts = req.url.split("?")[0].split("/").filter(Boolean);
        const apiIndex = parts.indexOf("api");
        const rootIndex = apiIndex === -1 ? 0 : apiIndex + 1;

        // Legacy Support: Admin panel uses "/question/mcq/..." 
        // We normalize this so "question" becomes the root and "mcq" becomes subResource
        let resource = parts[rootIndex];
        let subResource = parts[rootIndex + 1];
        let param = parts[rootIndex + 2];
        let param2 = parts[rootIndex + 3];

        if (resource === "question") {
            resource = subResource; // mcq, fillblank, descriptive
            subResource = param;    // unit, bulk, or ID
            param = param2;         // the actual ID
        }

        // Normalize pluralization for mapping
        // Frontend uses "/subjects", Admin uses "/subject"
        const normalize = (r) => {
            if (r === "subject") return "subjects";
            if (r === "unit") return "units";
            return r;
        };
        const normalizedResource = normalize(resource);

        // Map to collection names
        const collectionMap = {
            subjects: "subjects",
            units: "units",
            mcq: "mcqs",
            fillblank: "fillblanks",
            descriptive: "descriptives",
        };

        const collectionName = collectionMap[normalizedResource];
        const secret = req.headers['x-second-space-secret'];
        const SERVER_SECRET = process.env.SECOND_SPACE_SECRET || 'nullptr_secret_123';
        const isAdmin = secret === SERVER_SECRET;

        const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);
        const toId = (id) => new mongoose.Types.ObjectId(id);

        // 🔒 AUTH GUARD: Only GET and verify-pin allowed without secret
        if (req.method !== "GET" && resource !== "verify-pin" && !isAdmin) {
            return res.status(403).json({ message: "Admin secret required for mutations" });
        }

        /* -------------------------------------------------- */
        /* 🛠️ A. AUTH & UTILITY ROUTES                       */
        /* -------------------------------------------------- */
        if (resource === "verify-pin" && req.method === "POST") {
            const { pin } = req.body;
            if (pin === (process.env.SECOND_SPACE_PIN || "2606")) {
                return res.status(200).json({ secret: SERVER_SECRET });
            }
            return res.status(401).json({ message: "Invalid PIN" });
        }

        /* -------------------------------------------------- */
        /* 📚 B. DATA ROUTES (CRUD)                          */
        /* -------------------------------------------------- */
        if (!collectionName) {
            return res.status(404).json({ message: "Resource not found", resource });
        }

        const Model = getModel(collectionName);

        // 1. GET (Read)
        if (req.method === "GET") {
            let data = null;

            if (!subResource || subResource === "all") {
                // List all (Apply visibility filter for non-admin on subjects)
                let query = {};
                if (normalizedResource === "subjects" && !isAdmin) {
                    query = { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }, { visibility: null }] };
                }
                data = await Model.find(query).lean();
            } else if (subResource === "subject" || subResource === "unit") {
                // Filtered List (e.g. /units/subject/ID or /mcq/unit/ID)
                const queryKey = subResource === "subject" ? "subjectId" : "unitId";
                if (!isValidId(param)) return res.status(400).json({ message: "Invalid ID param" });
                data = await Model.find({ [queryKey]: toId(param) }).lean();
            } else if (isValidId(subResource)) {
                // Single Item
                data = await Model.findById(subResource).lean();
            }

            if (!data) return res.status(404).json({ message: "Data not found" });

            // Caching
            res.setHeader("Vary", "x-second-space-secret");
            res.setHeader("Cache-Control", isAdmin ? "private, no-cache" : "public, s-maxage=60, stale-while-revalidate=300");
            return res.status(200).json(data);
        }

        // 2. POST (Create)
        if (req.method === "POST") {
            if (subResource === "bulk") {
                // Bulk operations (Admin panel uses these)
                const { mcqs, fillBlanks, descriptives, unitId, subjectId } = req.body;
                const items = mcqs || fillBlanks || descriptives;
                if (!items || !Array.isArray(items)) return res.status(400).json({ message: "Invalid bulk data" });

                const docs = items.map(item => ({ ...item, unitId: toId(unitId), subjectId: toId(subjectId) }));
                await Model.insertMany(docs);
                await incrementSubjectVersion(subjectId);
                return res.status(201).json({ message: "Bulk insert success" });
            }

            const doc = await Model.create(req.body);
            if (req.body.subjectId) await incrementSubjectVersion(req.body.subjectId);
            return res.status(201).json(doc);
        }

        // 3. PUT (Update)
        if (req.method === "PUT") {
            if (!isValidId(subResource)) return res.status(400).json({ message: "Valid ID required for update" });
            const doc = await Model.findByIdAndUpdate(subResource, req.body, { new: true });
            if (doc?.subjectId) await incrementSubjectVersion(doc.subjectId);
            else if (normalizedResource === "subjects") await incrementSubjectVersion(subResource);
            return res.status(200).json(doc);
        }

        // 4. DELETE
        if (req.method === "DELETE") {
            let deletedId = subResource;
            if (subResource === "bulk") {
                const { ids } = req.body;
                const firstItem = await Model.findById(ids[0]);
                const sId = firstItem?.subjectId;
                await Model.deleteMany({ _id: { $in: ids.map(toId) } });
                if (sId) await incrementSubjectVersion(sId);
                return res.status(200).json({ message: "Bulk delete success" });
            }

            const item = await Model.findById(deletedId);
            const subjectId = item?.subjectId;
            await Model.findByIdAndDelete(deletedId);
            if (subjectId) await incrementSubjectVersion(subjectId);
            else if (normalizedResource === "subjects") await incrementSubjectVersion(deletedId);

            return res.status(200).json({ message: "Delete success" });
        }

    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

/**
 * Automatically increments Subject version to trigger frontend cache invalidation
 */
async function incrementSubjectVersion(subjectId) {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) return;
    try {
        await getModel("subjects").findByIdAndUpdate(subjectId, { $inc: { version: 1 } });
        console.log(`🔄 Version incremented for subject: ${subjectId}`);
    } catch (e) {
        console.error("Failed to increment version:", e);
    }
}
