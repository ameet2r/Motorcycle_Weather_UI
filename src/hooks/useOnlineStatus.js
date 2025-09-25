import { useState, useEffect } from 'react';

/**
 * Custom hook to track online status with enhanced connectivity checking
 * @returns {boolean} - True if online, false if offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Handler for browser online event
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handler for browser offline event
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check every 30 seconds
    const pingInterval = setInterval(async () => {
      try {
        // Ping the backend root endpoint to confirm actual connectivity
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/`, { method: 'GET' });
        // If response is ok, we're online
        setIsOnline(response.ok);
      } catch (error) {
        // If ping fails, consider offline
        console.warn('Connectivity ping failed:', error.message);
        setIsOnline(false);
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  return isOnline;
};