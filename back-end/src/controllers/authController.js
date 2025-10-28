import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const { password: _pw, __v, ...safeUser } = user.toObject();
  res.json({ user: { id: String(safeUser._id), ...safeUser }, token });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  const { password: _pw, __v, ...safeUser } = user.toObject();
  res
    .status(201)
    .json({ user: { id: String(safeUser._id), ...safeUser }, token });
};

export const profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const obj = user.toObject();
  res.json({ id: String(obj._id), ...obj });
};

export const updateProfile = async (req, res) => {
  const updates = {};
  const allowed = ["name", "avatar"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const obj = user.toObject();
  res.json({ id: String(obj._id), ...obj });
};
