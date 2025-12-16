export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        if (method !== "GET") {
            return json({ message: "Only GET allowed" }, 405);
        }

        /* -------------------------------------------------- */
        /* 🔓 ADMIN / PREVIEW BYPASS (NO CACHE)               */
        /* -------------------------------------------------- */
        const isPreview = url.searchParams.get("preview") === "true";

        /* -------------------------------------------------- */
        /* ⚡ EDGE CACHE                                      */
        /* -------------------------------------------------- */
        const cache = caches.default;

        if (!isPreview) {
            const cached = await cache.match(request);
            if (cached) return cached;
        }

        try {
            let response;

            /* ---------------- SUBJECTS ---------------- */
            if (path === "/subjects") {
                response = await mongoFind(env, "subjects", {});
            }

            else if (path.startsWith("/subjects/")) {
                const id = path.split("/")[2];
                response = await mongoFindOne(env, "subjects", { _id: oid(id) });
            }

            /* ---------------- UNITS ---------------- */
            else if (path.startsWith("/units/subject/")) {
                const subjectId = path.split("/")[3];
                response = await mongoFind(env, "units", { subjectId });
            }

            else if (path.startsWith("/units/")) {
                const id = path.split("/")[2];
                response = await mongoFindOne(env, "units", { _id: oid(id) });
            }

            /* ---------------- QUESTIONS ---------------- */
            else if (path.startsWith("/mcq/unit/")) {
                const unitId = path.split("/")[3];
                response = await mongoFind(env, "mcqs", { unitId });
            }

            else if (path.startsWith("/fillblank/unit/")) {
                const unitId = path.split("/")[3];
                response = await mongoFind(env, "fillblanks", { unitId });
            }

            else if (path.startsWith("/descriptive/unit/")) {
                const unitId = path.split("/")[3];
                response = await mongoFind(env, "descriptives", { unitId });
            }

            else {
                return json({ message: "Route not found" }, 404);
            }

            /* -------------------------------------------------- */
            /* 🧠 CACHE + REVALIDATION                            */
            /* -------------------------------------------------- */
            if (!isPreview) {
                response.headers.set(
                    "Cache-Control",
                    "public, max-age=60, stale-while-revalidate=300"
                );

                await cache.put(request, response.clone());
            }

            return response;

        } catch (err) {
            return json({ message: err.message }, 500);
        }
    }
};

/* ====================================================== */
/* 🔧 HELPERS                                             */
/* ====================================================== */

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

function oid(id) {
    return { "$oid": id };
}

/* ---------------- MONGO HELPERS ---------------- */

async function mongoFind(env, collection, filter) {
    const res = await fetch(`${env.DATA_API_URL}/action/find`, {
        method: "POST",
        headers: mongoHeaders(env),
        body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE_NAME,
            collection,
            filter
        })
    });

    const data = await res.json();
    return json(data.documents);
}

async function mongoFindOne(env, collection, filter) {
    const res = await fetch(`${env.DATA_API_URL}/action/findOne`, {
        method: "POST",
        headers: mongoHeaders(env),
        body: JSON.stringify({
            dataSource: env.DATA_SOURCE,
            database: env.DATABASE_NAME,
            collection,
            filter
        })
    });

    const data = await res.json();
    return json(data.document);
}

function mongoHeaders(env) {
    return {
        "Content-Type": "application/json",
        "api-key": env.DATA_API_KEY
    };
}
