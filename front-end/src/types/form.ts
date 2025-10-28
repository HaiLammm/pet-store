export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface PetForm {
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  dob?: string;
  litter?: string[];
  description: string;
  images: FileList | string[];
  health: {
    vaccinated: boolean;
    dewormed: boolean;
    healthCertificate: boolean;
  };
  characteristics: {
    size: string;
    color: string;
    weight: number;
    personality: string[];
  };
  location: string;
}
