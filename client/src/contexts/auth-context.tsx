import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { FirebaseError } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  onIdTokenChanged
} from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (code: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Transform Firebase User to our User model
  const transformUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user', // Default role, will be updated from the backend
      createdAt: new Date(Number(firebaseUser.metadata.creationTime) || Date.now()),
      metadata: {
        lastSignInTime: firebaseUser.metadata.lastSignInTime,
        creationTime: firebaseUser.metadata.creationTime,
      },
    };
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const auth = getAuth();
    
    // Setup auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // Get the user's details from our backend to get the role
          const response = await apiClient.auth.me();
          const userData = response.data.user;
          
          setUser({
            ...transformUser(firebaseUser),
            role: userData.role || 'user',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
    
    // Setup token refresh listener
    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('auth-token', token);
      } else {
        localStorage.removeItem('auth-token');
      }
    });
    
    // Clean up subscription
    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from our backend
      const response = await apiClient.auth.me();
      const userData = response.data.user;
      
      const user = {
        ...transformUser(userCredential.user),
        role: userData.role || 'user',
      };
      
      setUser(user);
      toast.success('Signed in successfully', 'Welcome back!');
      return user;
    } catch (err) {
      let message = 'Failed to sign in';
      
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            message = 'This account has been disabled';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            message = 'Invalid email or password';
            break;
          default:
            message = err.message;
            break;
        }
      }
      
      const error = new Error(message);
      setError(error);
      toast.error('Sign in failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email, password, and name
  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Register user in our backend
      await apiClient.auth.register({
        email,
        password, // This should be handled securely in the backend
        name
      });
      
      const user = transformUser(userCredential.user);
      setUser(user);
      
      toast.success('Account created successfully', 'Welcome to our platform!');
      return user;
    } catch (err) {
      let message = 'Failed to create account';
      
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            message = 'This email is already in use';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak';
            break;
          default:
            message = err.message;
            break;
        }
      }
      
      const error = new Error(message);
      setError(error);
      toast.error('Sign up failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      
      // Also sign out from our backend
      await apiClient.auth.logout();
      
      setUser(null);
      navigate('/');
      toast.success('Signed out successfully', 'See you soon!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      const error = new Error(message);
      setError(error);
      toast.error('Sign out failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent', 'Check your inbox for instructions');
    } catch (err) {
      let message = 'Failed to send password reset email';
      
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
          case 'auth/user-not-found':
            message = 'No account found with this email';
            break;
          default:
            message = err.message;
            break;
        }
      }
      
      const error = new Error(message);
      setError(error);
      toast.error('Password reset failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm password reset
  const confirmResetPassword = async (code: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, code, newPassword);
      toast.success('Password reset successful', 'You can now sign in with your new password');
      navigate('/login');
    } catch (err) {
      let message = 'Failed to reset password';
      
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/expired-action-code':
            message = 'The reset link has expired';
            break;
          case 'auth/invalid-action-code':
            message = 'The reset link is invalid';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak';
            break;
          default:
            message = err.message;
            break;
        }
      }
      
      const error = new Error(message);
      setError(error);
      toast.error('Password reset failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: { name?: string; photoURL?: string }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await updateProfile(currentUser, data);
      
      // Update profile in our backend
      await apiClient.users.updateProfile({
        name: data.name,
        photoURL: data.photoURL,
      });
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          name: data.name || user.name,
          photoURL: data.photoURL || user.photoURL,
        });
      }
      
      toast.success('Profile updated successfully', 'Your profile has been updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      const error = new Error(message);
      setError(error);
      toast.error('Profile update failed', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    confirmResetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 