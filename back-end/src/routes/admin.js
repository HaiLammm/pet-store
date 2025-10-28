import express from "express";
import Pet from "../models/Pet.js";
import Settings from "../models/Settings.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const [total, males, females, kittens] = await Promise.all([
      Pet.countDocuments({}),
      Pet.countDocuments({ gender: "male" }),
      Pet.countDocuments({ gender: "female" }),
      Pet.countDocuments({ age: { $lte: 1.2 } }), // align with frontend kittens filter
    ]);

    res.json({ total, males, females, kittens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

export default router;

// Settings endpoints
router.get("/settings", async (_req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Protect update with auth middleware
router.put("/settings", auth, async (req, res) => {
  try {
    const data = req.body || {};
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});
    // Shallow merge (hero, about, contact)
    settings.set({ ...settings.toObject(), ...data });
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});
