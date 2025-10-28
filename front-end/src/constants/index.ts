// App-wide constants

export const APP_NAME = "PetStore";
// Normalize API base URL from env; ensure it ends with /api and no trailing slash duplication
const RAW_API =
  process.env.NEXT_PUBLIC_API_URL || "https://pet-store-1yhh.onrender.com/api";
const STRIPPED = RAW_API.replace(/\/$/, "");
export const API_BASE_URL = /\/api$/.test(STRIPPED)
  ? STRIPPED
  : `${STRIPPED}/api`;

export const ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const GENDERS = ["male", "female"] as const;
