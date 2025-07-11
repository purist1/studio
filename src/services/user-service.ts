'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { User } from '@/lib/types';

const dbPath = path.join(process.cwd(), 'src', 'lib', 'users.json');

/**
 * Reads all users from the JSON file database.
 * @returns A promise that resolves to an array of User objects.
 */
async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error('Failed to read user data:', error);
    throw new Error('Could not retrieve user data.');
  }
}

/**
 * Finds a user by their email address.
 * @param email The email to search for.
 * @returns The user object if found, otherwise null.
 */
async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Adds a new user to the database.
 * @param newUser The new user data (without id).
 * @returns An object indicating success or failure.
 */
export async function addUser(newUser: Omit<User, 'id'>): Promise<{ success: boolean; message: string }> {
  const users = await getUsers();
  const existingUser = await findUserByEmail(newUser.email);

  if (existingUser) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const userWithId: User = {
    ...newUser,
    id: new Date().getTime().toString(),
  };

  users.push(userWithId);
  await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf-8');
  return { success: true, message: 'User created successfully.' };
}

/**
 * Authenticates a user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The user object if authentication is successful, otherwise null.
 */
export async function loginUser(email: string, password: string): Promise<User | null> {
    const user = await findUserByEmail(email);
    if (user && user.password === password) {
        // In a real app, never store or compare plain text passwords.
        // Use a library like bcrypt to hash passwords on signup and compare hashes on login.
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}
