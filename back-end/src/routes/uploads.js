import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Helper to parse base64 or remote URL uploads; for multipart, recommend using formidable/multer
router.post("/image", async (req, res) => {
  try {
    const { image, folder = "pets" } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ message: "No image provided" });
    }
    const cfg = cloudinary.config();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      return res
        .status(500)
        .json({ message: "Cloudinary is not configured on the server" });
    }
    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: "auto",
    });
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("/api/uploads/image error:", err);
    res.status(500).json({ message: err?.message || "Upload failed" });
  }
});

router.delete("/image", async (req, res) => {
  try {
    const { imageUrl, public_id } = req.body;
    const id =
      public_id ||
      (imageUrl ? imageUrl.split("/").pop()?.split(".")[0] : undefined);
    if (!id)
      return res.status(400).json({ message: "No image identifier provided" });
    await cloudinary.uploader.destroy(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

export default router;
