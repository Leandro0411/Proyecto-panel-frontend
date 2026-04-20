export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
