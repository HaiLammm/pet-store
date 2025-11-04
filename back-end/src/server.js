import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import petsRouter from "./routes/pets.js";
import uploadsRouter from "./routes/uploads.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
// Allow larger JSON bodies for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/pets", petsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/admin", adminRouter);

// Sample route
app.get("/", (req, res) => {
  res.send("Pet Shop API is running");
});

// Start server123
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
