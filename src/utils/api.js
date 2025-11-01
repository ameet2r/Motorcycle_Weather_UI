import { auth, appCheck } from './firebase';
import { getIdToken } from 'firebase/auth';
import { getToken } from 'firebase/app-check';

/**
 * Makes an authenticated API request with Firebase ID token and App Check token
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

    // Get the App Check token
    const appCheckTokenResponse = await getToken(appCheck, /* forceRefresh */ false);
    const appCheckToken = appCheckTokenResponse.token;

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      'X-Firebase-AppCheck': appCheckToken,
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
        const refreshedAppCheckTokenResponse = await getToken(appCheck, /* forceRefresh */ true);
        const refreshedAppCheckToken = refreshedAppCheckTokenResponse.token;

        const retryResponse = await fetch(`${import.meta.env.VITE_BACKEND_API}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${refreshedToken}`,
            'X-Firebase-AppCheck': refreshedAppCheckToken
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
 * Makes an authenticated DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Parsed JSON response or empty for 204
 */
export const authenticatedDelete = async (endpoint) => {
  const response = await authenticatedFetch(endpoint, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
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

/**
 * Fetch active weather alerts for specified coordinates
 * @param {Array<{latLng: {latitude: string, longitude: string}}>} coordinates - Array of coordinates to check
 * @returns {Promise<{alerts: Object, user_info: Object}>} - Map of coordinate keys to alerts
 */
export const fetchWeatherAlerts = async (coordinates) => {
  return authenticatedPost('/WeatherAlerts/', { coordinates });
};