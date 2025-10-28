// Mock data for Pet, User, Cart, Order, Address
import type { Pet } from "@/types/pet";
import type { User } from "@/types/user";
import type { Address } from "@/types/address";

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "alice@example.com",
    name: "Alice Nguyen",
    role: "customer",
    avatar: "/avatars/alice.png",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "u2",
    email: "bob@example.com",
    name: "Bob Tran",
    role: "admin",
    avatar: "/avatars/bob.png",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
];

export const mockPets: Pet[] = [
  {
    id: "p1",
    name: "Milo",
    breed: "Golden Retriever",
    litter: ["Litter 2"],
    age: 2,
    gender: "male",
    dob: "2022-05-10T00:00:00.000Z",
    description: "Friendly, playful, and loves kids.",
    petImages: ["/pets/milo1.jpg", "/pets/milo2.jpg"],
    health: {
      vaccinated: true,
      dewormed: true,
      healthCertificate: true,
    },
    characteristics: {
      size: "large",
      color: "golden",
      weight: 32,
      personality: ["friendly", "playful", "loyal"],
    },
    location: "Hanoi, Vietnam",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "p2",
    name: "Luna",
    breed: "British Shorthair",
    age: 1,
    litter: ["Litter 1"],
    gender: "female",
    dob: "2023-06-20T00:00:00.000Z",
    description: "Calm, affectionate, and easy to care for.",
    petImages: ["/pets/luna1.jpg", "/pets/luna2.jpg"],
    health: {
      vaccinated: true,
      dewormed: true,
      healthCertificate: true,
    },
    characteristics: {
      size: "medium",
      color: "gray",
      weight: 5,
      personality: ["calm", "affectionate"],
    },
    location: "HCMC, Vietnam",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
];

export const mockAddresses: Address[] = [
  {
    fullName: "Alice Nguyen",
    phone: "0901234567",
    street: "123 Nguyen Trai",
    city: "Hanoi",
    district: "Thanh Xuan",
    ward: "Thuong Dinh",
    postalCode: "100000",
    country: "Vietnam",
  },
  {
    fullName: "Bob Tran",
    phone: "0912345678",
    street: "456 Le Loi",
    city: "HCMC",
    district: "District 1",
    ward: "Ben Nghe",
    postalCode: "700000",
    country: "Vietnam",
  },
];
