import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Pet Store" },
    // Legacy object-based sections kept for backward compatibility
    homeSections: {
      headSection: {
        contentHtml: {
          type: String,
          default:
            "<h2>Our kings and queens</h2><p>Our breeding program emphasizes thorough health testing for sire, dams &amp; kittens. This ensures healthy parents, reduces the risk of genetic issues, and promotes lifelong well-being in our kittens.</p>",
        },
        bgColor: { type: String, default: "#b91c1c" },
      },
      bottomSection: {
        contentHtml: {
          type: String,
          default:
            "<h2>What are you paying for:</h2><p>You are paying for a beautiful cat, for our reputation, and for our many years of work on improving and perfecting the breed in terms of health, appearance, and size.</p>",
        },
      },
    },
    // New: ordered list of homepage sections
    sections: [
      new mongoose.Schema(
        {
          title: { type: String, default: "" },
          contentHtml: { type: String, default: "" },
          bgColor: { type: String, default: "" },
          textColor: { type: String, default: "" },
          fontSize: { type: Number, default: 0 },
          order: { type: Number, default: 1 },
        },
        { _id: true, id: true }
      ),
    ],
    // Position of the Featured block among homepage sections (1..sections.length+1)
    featuredPosition: { type: Number, default: 0 },
    hero: {
      home: {
        title: { type: String, default: "Welcome to our Cattery" },
        subtitle: {
          type: String,
          default: "Healthy, socialized cats and kittens.",
        },
        images: [{ type: String }],
      },
      kings: {
        title: { type: String, default: "Available Males" },
        subtitle: {
          type: String,
          default: "Champion bloodlines and excellent temperaments.",
        },
        images: [{ type: String }],
      },
      queens: {
        title: { type: String, default: "Available Females" },
        subtitle: {
          type: String,
          default: "Elegant queens with wonderful personalities.",
        },
        images: [{ type: String }],
      },
      kittens: {
        title: { type: String, default: "Kittens for Sale" },
        subtitle: {
          type: String,
          default: "Playful, healthy kittens ready for loving homes.",
        },
        images: [{ type: String }],
      },
    },
    // Admin-selected featured pets (order preserved)
    featuredPetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
    about: {
      title: { type: String, default: "About Us" },
      content: { type: String, default: "" },
      images: [{ type: String }],
    },
    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      imessage: { type: String, default: "" },
      mapEmbed: { type: String, default: "" },
      content: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
