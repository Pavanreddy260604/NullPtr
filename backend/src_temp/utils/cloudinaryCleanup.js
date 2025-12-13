import cloudinary from "../config/cloudinary.js";

/**
 * Delete an image from Cloudinary using its full URL.
 * Works for nested folders like wasa-learn/uploads/image.jpg
 */
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("res.cloudinary.com")) {
      console.warn("⚠️ Skipping invalid Cloudinary URL:", imageUrl);
      return;
    }

    // Extract the full path after 'upload/' and remove file extension
    const match = imageUrl.match(/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);

    if (!match || !match[1]) {
      console.warn("⚠️ Could not extract public_id from URL:", imageUrl);
      return;
    }

    const publicId = match[1]; // e.g. wasa-learn/uploads/aub230v3rbckkuuzq5wa
    console.log("🧩 Deleting Cloudinary asset:", publicId);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "ok") {
      console.log(`🗑️ Successfully deleted: ${publicId}`);
    } else if (result.result === "not found") {
      console.log(`⚠️ Cloudinary file not found: ${publicId}`);
    } else {
      console.log(`⚠️ Unexpected Cloudinary response:`, result);
    }
  } catch (err) {
    console.error("❌ Cloudinary cleanup failed:", err.message);
  }
};
