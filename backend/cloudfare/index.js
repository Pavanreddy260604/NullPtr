export default {
    // Required fetch handler
    async fetch(request, env, ctx) {
        return new Response("Worker is running", { status: 200 });
    },

    // Cron job
    async scheduled(event, env, ctx) {
        try {
            const response = await fetch(
                "https://study-g3xc.onrender.com/health",
                {
                    method: "GET",
                    headers: {
                        "User-Agent": "CF-Worker-Cron",
                    },
                }
            );

            console.log("GET status:", response.status);
        } catch (error) {
            console.error("GET failed:", error);
        }
    },
};
