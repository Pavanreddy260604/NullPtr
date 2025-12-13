import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // ✅ use shared config
import streamifier from "streamifier";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

export default router;
