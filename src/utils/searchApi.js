import { authenticatedPost, authenticatedGet, authenticatedDelete, authenticatedPatch } from './api';

/**
 * Save a search to the backend
 * @param {Object} searchData - The search data to save
 * @returns {Promise<Object>} The saved search object with createdAt/updatedAt
 */
export async function saveSearchToBackend(searchData) {
  return await authenticatedPost('/searches/', searchData);
}

/**
 * Get all searches from the backend
 * @param {number} limit - Maximum number of searches to return (default: 50)
 * @param {number} offset - Number of searches to skip (default: 0)
 * @param {string} search - Optional search query to filter by address (default: null)
 * @returns {Promise<Object>} Object with searches array, total, limit, offset
 */
export async function getSearchesFromBackend(limit = 50, offset = 0, search = null) {
  let url = `/searches/?limit=${limit}&offset=${offset}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return await authenticatedGet(url);
}

/**
 * Get a specific search by ID from the backend
 * @param {string} searchId - The search ID to retrieve
 * @returns {Promise<Object>} The search object
 */
export async function getSearchByIdFromBackend(searchId) {
  return await authenticatedGet(`/searches/${searchId}`);
}

/**
 * Delete a specific search from the backend
 * @param {string} searchId - The search ID to delete
 * @returns {Promise<void>}
 */
export async function deleteSearchFromBackend(searchId) {
  return await authenticatedDelete(`/searches/${searchId}`);
}

/**
 * Clear all searches from the backend
 * @returns {Promise<void>}
 */
export async function clearAllSearchesFromBackend() {
  return await authenticatedDelete('/searches/');
}

/**
 * Update a search name
 * @param {string} searchId - The search ID
 * @param {string} name - New name (empty string to remove)
 * @returns {Promise<Object>} The updated search object
 */
export async function updateSearchName(searchId, name) {
  return await authenticatedPatch(`/searches/${searchId}`, { name });
}
