export interface PetFilters {
  breed?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: string[];
  size?: string[];
  location?: string[];
}

export interface SearchParams {
  q?: string;
  filters?: PetFilters;
  sortBy?: "age" | "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
