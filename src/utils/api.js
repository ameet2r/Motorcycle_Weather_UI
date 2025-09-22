import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

/**
 * Makes an authenticated API request with Firebase ID token
 * @param {string} endpoint - API endpoint (relative to VITE_BACKEND_API)
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Get the ID token
    const idToken = await getIdToken(user);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...options.headers
    };

    // Make the API request
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API}${endpoint}`, {
      ...options,
      headers
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Token might be expired, try to refresh
      try {
        const refreshedToken = await getIdToken(user, true); // Force refresh
        const retryResponse = await fetch(`${import.meta.env.VITE_BACKEND_API}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${refreshedToken}`
          }
        });
        
        if (retryResponse.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        
        return retryResponse;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    
    // Re-throw authentication errors
    if (error.message.includes('Authentication failed') || 
        error.message.includes('No authenticated user')) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Generic error
    throw new Error('An error occurred while making the request. Please try again.');
  }
};

/**
 * Makes an authenticated POST request with JSON body
 * @param {string} endpoint - API endpoint
 * @param {object} data - Data to send in request body
 * @returns {Promise<any>} - Parsed JSON response
 */
export const authenticatedPost = async (endpoint, data) => {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

/**
 * Makes an authenticated GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Parsed JSON response
 */
export const authenticatedGet = async (endpoint) => {
  const response = await authenticatedFetch(endpoint, {
    method: 'GET'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

/**
 * Checks if an error is an authentication error that requires re-login
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's an auth error requiring re-login
 */
export const isAuthError = (error) => {
  return error.message.includes('Authentication failed') ||
         error.message.includes('No authenticated user') ||
         error.message.includes('Access denied');
};