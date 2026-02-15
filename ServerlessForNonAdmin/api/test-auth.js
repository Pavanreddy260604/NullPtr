import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(204).end();

    console.log("=== Test Auth Handler ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    console.log("Body type:", typeof req.body);
    console.log("Body:", req.body);

    try {
        // Test environment variables
        console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
        console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
        console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

        // Test dependencies
        console.log("mongoose imported:", !!mongoose);
        console.log("jwt imported:", !!jwt);
        console.log("bcrypt imported:", !!bcrypt);

        // Test bcrypt
        const testHash = await bcrypt.hash("testpassword", 12);
        console.log("bcrypt hash created:", !!testHash);
        console.log("hash length:", testHash.length);

        // Test JWT
        const testToken = jwt.sign({ test: "data" }, process.env.JWT_SECRET || "test-secret");
        console.log("JWT token created:", !!testToken);
        console.log("token length:", testToken.length);

        // Test MongoDB connection if URI exists
        if (process.env.MONGO_URI) {
            try {
                console.log("Testing MongoDB connection...");
                const connection = await mongoose.connect(process.env.MONGO_URI, {
                    bufferCommands: false,
                    maxPoolSize: 1
                });
                console.log("MongoDB connected successfully");
                console.log("DB name:", connection.connection.name);
            } catch (dbError) {
                console.error("MongoDB connection error:", dbError);
            }
        }

        return res.json({
            success: true,
            message: "Auth system test passed",
            tests: {
                environment: {
                    mongoUri: !!process.env.MONGO_URI,
                    jwtSecret: !!process.env.JWT_SECRET,
                    resendApiKey: !!process.env.RESEND_API_KEY
                },
                dependencies: {
                    mongoose: !!mongoose,
                    jwt: !!jwt,
                    bcrypt: !!bcrypt
                },
                body: req.body
            }
        });

    } catch (error) {
        console.error("=== Test Auth Error ===");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        return res.status(500).json({
            success: false,
            error: "Test failed",
            message: error.message,
            stack: error.stack
        });
    }
}
