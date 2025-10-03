import {
  getSearchHistory,
  saveSearchToHistory,
  getSearchById as getSearchByIdLocal,
  clearSearchHistory as clearSearchHistoryLocal
} from './localStorage';
import {
  saveSearchToBackend,
  getSearchesFromBackend,
  getSearchByIdFromBackend,
  deleteSearchFromBackend,
  clearAllSearchesFromBackend
} from './searchApi';

const STORAGE_KEY = 'weather_search_history';

/**
 * Check if user has premium tier (plus or pro)
 * @param {string} membershipTier - User's membership tier
 * @returns {boolean}
 */
function isPremiumTier(membershipTier) {
  return membershipTier === 'plus' || membershipTier === 'pro';
}

/**
 * Update localStorage cache with searches array
 * @param {Array} searches - Array of search objects
 */
function updateLocalStorageCache(searches) {
  try {
    const dataToSave = { searches };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error updating localStorage cache:', error);
  }
}

/**
 * Add a single search to the beginning of localStorage cache
 * @param {Object} searchData - Search object to add
 */
function addToLocalStorageCache(searchData) {
  try {
    const searches = getSearchHistory();
    searches.unshift(searchData);
    updateLocalStorageCache(searches);
  } catch (error) {
    console.error('Error adding to localStorage cache:', error);
  }
}

/**
 * Remove a search from localStorage cache by ID
 * @param {string} searchId - ID of search to remove
 */
function removeFromLocalStorageCache(searchId) {
  try {
    const searches = getSearchHistory();
    const filtered = searches.filter(s => s.id !== searchId);
    updateLocalStorageCache(filtered);
  } catch (error) {
    console.error('Error removing from localStorage cache:', error);
  }
}

/**
 * Check if two coordinate sets are equal (same lat/lng pairs, order independent)
 * @param {Array} coords1 - First coordinate array
 * @param {Array} coords2 - Second coordinate array
 * @returns {boolean} True if coordinates match
 */
function coordinatesMatch(coords1, coords2) {
  if (!coords1 || !coords2 || coords1.length !== coords2.length) {
    return false;
  }

  // Create sorted strings of lat:lng pairs for comparison
  const set1 = coords1.map(c => `${c.latitude}:${c.longitude}`).sort().join('|');
  const set2 = coords2.map(c => `${c.latitude}:${c.longitude}`).sort().join('|');

  return set1 === set2;
}

/**
 * Find searches with duplicate coordinates
 * @param {Array} newCoordinates - New coordinate array to check for duplicates
 * @param {string} excludeSearchId - Optional search ID to exclude from duplicate check
 * @returns {Array} Array of search IDs that are duplicates
 */
function findDuplicateSearches(newCoordinates, excludeSearchId = null) {
  const searches = getSearchHistory();
  const duplicates = [];

  for (const search of searches) {
    if (excludeSearchId && search.id === excludeSearchId) {
      continue; // Skip the search we're excluding
    }

    if (coordinatesMatch(search.coordinates, newCoordinates)) {
      duplicates.push(search.id);
    }
  }

  return duplicates;
}

/**
 * Delete searches that have duplicate coordinates
 * @param {Array} newCoordinates - New coordinate array
 * @param {string} membershipTier - User's membership tier
 * @param {string} excludeSearchId - Optional search ID to exclude from duplicate check
 * @returns {Promise<number>} Number of duplicates deleted
 */
async function deleteDuplicateSearches(newCoordinates, membershipTier, excludeSearchId = null) {
  const duplicateIds = findDuplicateSearches(newCoordinates, excludeSearchId);

  if (duplicateIds.length === 0) {
    return 0;
  }

  // Delete each duplicate (errors are already handled in deleteSearch)
  for (const searchId of duplicateIds) {
    await deleteSearch(searchId, membershipTier);
  }

  return duplicateIds.length;
}

/**
 * Save a search to appropriate storage based on membership tier
 * @param {Object} searchData - The search data to save
 * @param {string} membershipTier - User's membership tier
 * @param {string} originalSearchId - Optional ID of original search being replaced (for redo/edit)
 * @returns {Promise<boolean>} Success status
 */
export async function saveSearch(searchData, membershipTier, originalSearchId = null) {
  // Delete any duplicate searches (exclude originalSearchId to avoid double-deletion)
  await deleteDuplicateSearches(searchData.coordinates, membershipTier, originalSearchId);

  // Also explicitly delete the original search if provided (for redo/edit scenarios)
  if (originalSearchId) {
    await deleteSearch(originalSearchId, membershipTier);
  }

  if (!isPremiumTier(membershipTier)) {
    // Free tier: use localStorage only with 3 search limit
    return saveSearchToHistory(searchData, 'free');
  }

  // Plus/Pro tier: save to backend first, then update cache
  try {
    await saveSearchToBackend(searchData);
    addToLocalStorageCache(searchData);
    return true;
  } catch (error) {
    console.error('Error saving search to backend:', error);
    // Fallback: save to localStorage only
    saveSearchToHistory(searchData, membershipTier);
    throw error;
  }
}

/**
 * Get all searches from appropriate storage
 * @param {string} membershipTier - User's membership tier
 * @returns {Array} Array of search objects
 */
export function getAllSearches(membershipTier) {
  // Both free and premium use localStorage
  // For premium, this is a cache that gets synced from backend
  return getSearchHistory();
}

/**
 * Get a specific search by ID
 * @param {string} searchId - The search ID to find
 * @param {string} membershipTier - User's membership tier
 * @returns {Object|null} The search object or null if not found
 */
export function getSearchByIdFromStorage(searchId, membershipTier) {
  // Both free and premium use localStorage
  return getSearchByIdLocal(searchId);
}

/**
 * Sync searches from backend to localStorage cache (premium users only)
 * @param {string} membershipTier - User's membership tier
 * @param {number} limit - Maximum number of searches to fetch
 * @returns {Promise<Array>} Array of synced searches
 */
export async function syncSearchesFromBackend(membershipTier, limit = 50) {
  if (!isPremiumTier(membershipTier)) {
    // Free tier users don't sync from backend
    return getSearchHistory();
  }

  try {
    const response = await getSearchesFromBackend(limit, 0);
    const searches = response.searches || [];

    // Update localStorage cache with backend data
    updateLocalStorageCache(searches);

    return searches;
  } catch (error) {
    console.error('Error syncing searches from backend:', error);
    // Return cached data on error
    return getSearchHistory();
  }
}

/**
 * Delete a specific search
 * @param {string} searchId - The search ID to delete
 * @param {string} membershipTier - User's membership tier
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSearch(searchId, membershipTier) {
  if (!isPremiumTier(membershipTier)) {
    // Free tier: delete from localStorage only
    removeFromLocalStorageCache(searchId);
    return true;
  }

  // Plus/Pro tier: delete from backend first, then update cache
  try {
    await deleteSearchFromBackend(searchId);
    removeFromLocalStorageCache(searchId);
    return true;
  } catch (error) {
    // If it's a 404, the search doesn't exist in backend - just remove from localStorage
    if (error.message && error.message.includes('404')) {
      console.log(`Search ${searchId} not found in backend, removing from localStorage only`);
      removeFromLocalStorageCache(searchId);
      return true;
    }

    console.error('Error deleting search from backend:', error);
    throw error;
  }
}

/**
 * Clear all searches
 * @param {string} membershipTier - User's membership tier
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllSearches(membershipTier) {
  if (!isPremiumTier(membershipTier)) {
    // Free tier: clear localStorage only
    return clearSearchHistoryLocal();
  }

  // Plus/Pro tier: clear backend first, then update cache
  try {
    await clearAllSearchesFromBackend();
    clearSearchHistoryLocal();
    return true;
  } catch (error) {
    console.error('Error clearing searches from backend:', error);
    throw error;
  }
}

/**
 * Migrate existing localStorage searches to backend (for tier upgrades)
 * @param {string} membershipTier - User's new membership tier
 * @returns {Promise<Object>} Migration results
 */
export async function migrateSearchesToBackend(membershipTier) {
  if (!isPremiumTier(membershipTier)) {
    return { migrated: 0, failed: 0 };
  }

  const localSearches = getSearchHistory();
  if (localSearches.length === 0) {
    return { migrated: 0, failed: 0 };
  }

  let migrated = 0;
  let failed = 0;

  // Migrate each search to backend
  for (const search of localSearches) {
    try {
      await saveSearchToBackend(search);
      migrated++;
    } catch (error) {
      console.error(`Failed to migrate search ${search.id}:`, error);
      failed++;
    }
  }

  // Re-sync from backend to ensure cache is up to date
  await syncSearchesFromBackend(membershipTier);

  return { migrated, failed, total: localSearches.length };
}
