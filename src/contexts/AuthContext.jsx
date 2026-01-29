import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../utils/firebase';

// Create the authentication context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error helper
  const clearError = () => setError(null);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return 'If an account with that email address exists, a password reset link has been sent. Please check your email.';
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many reset requests. Please try again later.';
          break;
        default:
          errorMessage = 'An error occurred while sending the reset email. Please try again.';
      }
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(getAuthErrorMessage(error));
      throw error;
    }
  }, []);

  // Get current user's ID token
  const getIdTokenForUser = useCallback(async () => {
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }
      const token = await getIdToken(user);
      return token;
    } catch (error) {
      setError('Failed to get authentication token');
      throw error;
    }
  }, [user]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper function to convert Firebase auth errors to user-friendly messages
  const getAuthErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 8 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  // Context value
  const value = useMemo(() => ({
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    forgotPassword,
    getIdToken: getIdTokenForUser,
    clearError
  }), [user, loading, error, login, register, logout, forgotPassword, getIdTokenForUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;