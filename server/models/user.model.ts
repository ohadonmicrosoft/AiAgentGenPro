import { z } from 'zod';

/**
 * User schema validation using Zod
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable().optional(),
  photoURL: z.string().nullable().optional(),
  role: z.enum(['admin', 'user', 'manager', 'creator', 'viewer']).default('user'),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
  lastLoginAt: z.string().or(z.date()).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.string().default('en'),
    notifications: z.boolean().default(true),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export type User = z.infer<typeof userSchema>;

/**
 * User profile schema for updating user data
 */
export const userProfileUpdateSchema = userSchema.partial().omit({ id: true, email: true, createdAt: true });

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;

/**
 * Default user preferences
 */
export const defaultUserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: true,
};

/**
 * Create a new user record from Firebase auth data
 */
export function createUserFromAuth(firebaseUser: any): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || null,
    photoURL: firebaseUser.photoURL || null,
    role: 'user',
    createdAt: new Date().toISOString(),
    preferences: defaultUserPreferences,
  };
} 