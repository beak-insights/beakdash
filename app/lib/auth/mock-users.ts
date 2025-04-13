/**
 * Mock users for development authentication
 * In a real application, these would be stored in a database
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  image?: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    image: 'https://i.pravatar.cc/150?u=admin@example.com',
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    password: 'password',
    role: 'user',
    image: 'https://i.pravatar.cc/150?u=user@example.com',
  },
];