import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { authenticatedGet } from '../utils/api';
import { useAuth } from './AuthContext';

// Create the user context
const UserContext = createContext({});

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User provider component
export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const profile = await authenticatedGet('/user/profile');
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err.message);

      // If authentication fails, log the user out
      if (err.message.includes('Authentication failed') ||
          err.message.includes('401')) {
        await logout();
      }
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  // Listen for authentication state and token changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile
        await fetchUserProfile();
      } else {
        // User is signed out
        setUserProfile(null);
        setLoading(false);
        setError(null);
      }
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  // Context value
  const value = {
    userProfile,
    loading,
    error,
    refetchProfile: fetchUserProfile,
    membershipTier: userProfile?.membershipTier || 'free'
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;