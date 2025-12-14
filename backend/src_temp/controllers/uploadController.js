// src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // ✅ shared config
import streamifier from "streamifier";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* -------------------------------------------------------------------------- */
/* 🟢 SINGLE FILE UPLOAD (existing)                                            */
/* -------------------------------------------------------------------------- */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "wasa-learn/uploads",
                        resource_type: "auto",
                        transformation: [{ width: 1200, quality: "auto" }],
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(fileBuffer).pipe(uploadStream);
            });
        };

        const result = await streamUpload(req.file.buffer);
        res.status(201).json({
            message: "✅ File uploaded successfully!",
            fileUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
        });
    } catch (error) {
        console.error("❌ Upload failed:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
});

/* -------------------------------------------------------------------------- */
/* 🟢 BULK MULTI-FILE UPLOAD (for Descriptive Imports)                        */
/* -------------------------------------------------------------------------- */
router.post("/bulk", upload.array("files"), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded!" });
        }

        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "wasa-learn/bulk_diagrams",
                        resource_type: "auto",
                        transformation: [{ width: 1200, quality: "auto" }],
                    },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(fileBuffer).pipe(uploadStream);
            });
        };

        const uploads = await Promise.all(
            req.files.map(async (file, index) => {
                const result = await streamUpload(file.buffer);
                return {
                    ref: file.originalname,
                    fileUrl: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    size: result.bytes,
                };
            })
        );

        res.status(201).json({
            message: `✅ Successfully uploaded ${uploads.length} files`,
            images: uploads,
        });
    } catch (error) {
        console.error("❌ Bulk upload failed:", error);
        res.status(500).json({ message: "Bulk upload failed", error: error.message });
    }
});

/* -------------------------------------------------------------------------- */
/* 🔐 SIGNATURE ENDPOINT (for direct browser-to-Cloudinary uploads)            */
/* -------------------------------------------------------------------------- */
router.get("/signature", (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = req.query.folder || "wasa-learn/bulk_diagrams";

        // Generate signature for direct Cloudinary upload
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    } catch (error) {
        console.error("❌ Signature generation failed:", error);
        res.status(500).json({ message: "Failed to generate upload signature", error: error.message });
    }
});

export default router;
