import express from "express";
import * as authController from "../controllers/authController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/signin", authController.login);
router.post("/signup", authController.register);
router.get("/profile", auth, authController.profile);
router.put("/profile", auth, authController.updateProfile);
router.post("/logout", (_req, res) => res.json({ success: true }));
router.post("/refresh", (req, res) => {
  // In a real app you'd verify a refresh token; for now, return 401
  res.status(501).json({ message: "Refresh not implemented" });
});

export default router;
