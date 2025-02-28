import { firestore } from '../lib/firebase-admin';
import { User, UserProfileUpdate, createUserFromAuth } from '../models/user.model';
import { AppError, NotFoundError } from '../lib/error-handling';

/**
 * Collection reference for user profiles
 */
const userProfilesCollection = 'userProfiles';

/**
 * Service for managing user data
 */
export class UserService {
  /**
   * Get a user by ID
   */
  async getUserById(uid: string): Promise<User> {
    const userDoc = await firestore.collection(userProfilesCollection).doc(uid).get();
    
    if (!userDoc.exists) {
      throw new NotFoundError(`User with ID ${uid} not found`);
    }
    
    return userDoc.data() as User;
  }
  
  /**
   * Create a user profile from Firebase auth user
   */
  async createUserProfile(firebaseUser: any): Promise<User> {
    const newUser = createUserFromAuth(firebaseUser);
    
    await firestore
      .collection(userProfilesCollection)
      .doc(newUser.id)
      .set(newUser);
    
    return newUser;
  }
  
  /**
   * Get or create a user profile
   */
  async getOrCreateUserProfile(firebaseUser: any): Promise<User> {
    try {
      return await this.getUserById(firebaseUser.uid);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return await this.createUserProfile(firebaseUser);
      }
      throw error;
    }
  }
  
  /**
   * Update a user profile
   */
  async updateUserProfile(uid: string, updateData: UserProfileUpdate): Promise<User> {
    // Prevent overriding the user ID
    delete (updateData as any).id;
    
    // Add update timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    // Update user profile
    await firestore
      .collection(userProfilesCollection)
      .doc(uid)
      .update(dataToUpdate);
    
    // Get the updated user
    return this.getUserById(uid);
  }
  
  /**
   * Delete a user profile
   */
  async deleteUserProfile(uid: string): Promise<void> {
    // Check if user exists
    const userDoc = await firestore.collection(userProfilesCollection).doc(uid).get();
    
    if (!userDoc.exists) {
      throw new NotFoundError(`User with ID ${uid} not found`);
    }
    
    // Delete user profile
    await firestore.collection(userProfilesCollection).doc(uid).delete();
  }
} 