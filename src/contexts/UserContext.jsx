import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { authenticatedGet } from '../utils/api';
import { useAuth } from './AuthContext';
import { migrateSearchesToBackend } from '../utils/searchStorage';

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
  const previousTierRef = useRef(null);

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
      console.error('Failed to fetch user profile');
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

  // Migrate searches when user upgrades from free to plus/pro
  useEffect(() => {
    const currentTier = userProfile?.membershipTier;
    const previousTier = previousTierRef.current;

    // Check if user just upgraded from free to plus/pro
    if (previousTier === 'free' && (currentTier === 'plus' || currentTier === 'pro')) {
      const performMigration = async () => {
        try {
          const result = await migrateSearchesToBackend(currentTier);
          if (result.migrated > 0) {
            console.log(`Successfully migrated ${result.migrated} searches to the cloud`);
          }
        } catch (err) {
          console.error('Error migrating searches:', err);
        }
      };

      performMigration();
    }

    // Update the previous tier ref
    if (currentTier) {
      previousTierRef.current = currentTier;
    }
  }, [userProfile?.membershipTier]);

  // Context value
  const membershipTier = userProfile?.membershipTier || 'free';
  const value = useMemo(() => ({
    userProfile,
    loading,
    error,
    refetchProfile: fetchUserProfile,
    membershipTier
  }), [userProfile, loading, error, fetchUserProfile, membershipTier]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;