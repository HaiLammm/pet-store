export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  litter: string[];
  category?: "Kings" | "Queens" | "Kittens";
  // Keep UI-friendly casing while backend stores lowercase
  gender: "male" | "female";
  dob?: string;
  pedigreeURL?: string;
  description: string;
  petImages: string[];
  pedigreeImages?: string[];
  awardsImages?: string[];
  certificateImages?: string[];
  cattery?: string;
  health: {
    vaccinated: boolean;
    dewormed: boolean;
    healthCertificate: boolean;
  };
  characteristics: {
    size: "small" | "medium" | "large";
    color: string;
    weight: number;
    personality: string[];
  };
  location: string;
  createdAt: string;
  updatedAt: string;
}
