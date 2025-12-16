import dotenv from "dotenv";
console.log("🔹 Loading environment variables...");
dotenv.config();

import app from "./src_temp/app.js";
import connectDB from "./src_temp/config/db.js";

console.log("🔹 Connecting to MongoDB...");
connectDB();

const PORT = process.env.PORT || 5001;
console.log("🔹 Starting Express on port", PORT);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
