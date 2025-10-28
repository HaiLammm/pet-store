export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
