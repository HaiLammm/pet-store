import axios, { AxiosRequestHeaders } from "axios";
import { useAuthStore } from "@/store/cart";
import { PetFilters } from "@/types";
import { API_BASE_URL } from "@/constants";

// API parameter types
interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

interface UserData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header if present
api.interceptors.request.use((config) => {
  try {
    // access zustand store safely (during runtime in browser)
    const token =
      typeof window !== "undefined" ? useAuthStore.getState().token : null;
    if (token) {
      const headers: AxiosRequestHeaders = (config.headers ??
        {}) as AxiosRequestHeaders;
      headers["Authorization"] = `Bearer ${token}`;
      config.headers = headers;
    }
  } catch {}
  return config;
});

// Basic 401 handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        useAuthStore.getState().logout();
      } catch {}
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/signin", credentials),

  register: (userData: { email: string; password: string; name: string }) =>
    api.post("/auth/signup", userData),

  logout: () => api.post("/auth/logout"),

  refreshToken: () => api.post("/auth/refresh"),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: UpdateProfileData) => api.put("/auth/profile", data),
};

export const petsAPI = {
  getAll: (params?: QueryParams) => api.get("/pets", { params }),

  getById: (id: string) => api.get(`/pets/${id}`),

  create: (petData: FormData) =>
    api.post("/pets", petData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, petData: FormData) =>
    api.put(`/pets/${id}`, petData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/pets/${id}`),

  search: (query: string, filters?: PetFilters) =>
    api.get("/pets/search", { params: { q: query, ...filters } }),

  getByCategory: (species: string, params?: QueryParams) =>
    api.get(`/pets/category/${species}`, { params }),

  getFeatured: () => api.get("/pets/featured"),

  getRecommended: (userId?: string) =>
    api.get("/pets/recommended", { params: { userId } }),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),

  getUsers: (params?: QueryParams) => api.get("/admin/users", { params }),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, userData: UserData) =>
    api.put(`/admin/users/${id}`, userData),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  getPets: (params?: QueryParams) => api.get("/admin/pets", { params }),

  approvePet: (id: string) => api.put(`/admin/pets/${id}/approve`),

  rejectPet: (id: string) => api.put(`/admin/pets/${id}/reject`),

  getOrders: (params?: QueryParams) => api.get("/admin/orders", { params }),

  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
};

export const settingsAPI = {
  get: () => api.get("/admin/settings"),
  update: (data: unknown) => api.put("/admin/settings", data),
};

export const uploadsAPI = {
  // Preferred: send base64 data URL to backend Cloudinary proxy
  uploadBase64: (imageDataUrl: string, folder = "pets") =>
    api.post("/uploads/image", { image: imageDataUrl, folder }),

  // Legacy fallback: multipart form upload (backend currently expects JSON body)
  uploadImage: (file: File, folder = "pets") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    return api.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMultipleImages: (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });
    // Note: /uploads/images endpoint may not exist on backend; prefer uploadBase64 per file
    return api.post("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (imageUrl: string) =>
    api.delete("/uploads/image", { data: { imageUrl } }),
};

// Utility functions
export const handleAPIError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      return error.response.data.message || "Something went wrong";
    } else if (error.request) {
      // Request was made but no response received
      return "Network error. Please check your connection.";
    }
  }
  // Something else happened
  return error instanceof Error ? error.message : "Something went wrong";
};

export const createFormData = (data: Record<string, unknown>) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value instanceof FileList) {
      Array.from(value).forEach((file) => {
        formData.append(key, file);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, String(item));
      });
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export default api;
