import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    dob: { type: Date },
    litter: [{ type: String }],
    // High-level classification for UI sections
    // e.g., "Kings", "Queens", "Kittens"
    category: {
      type: String,
      enum: ["Kings", "Queens", "Kittens"],
    },
    gender: { type: String, enum: ["male", "female"], required: true },
    pedigreeURL: { type: String, default: "" },
    description: { type: String, default: "" },
    petImages: [{ type: String }],
    pedigreeImages: [{ type: String }],
    awardsImages: [{ type: String }],
    certificateImages: [{ type: String }],
    cattery: { type: String, default: "" },
    health: {
      vaccinated: { type: Boolean, default: false },
      dewormed: { type: Boolean, default: false },
      healthCertificate: { type: Boolean, default: false },
    },
    characteristics: {
      size: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      color: { type: String, default: "" },
      weight: { type: Number, default: 0 },
      personality: [{ type: String }],
    },
    location: { type: String, default: "" },
    // Parents for kittens
    fatherId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    motherId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
  },
  { timestamps: true }
);

export default mongoose.model("Pet", petSchema);
