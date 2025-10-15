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
import { syncQueue } from './syncQueue';

const STORAGE_KEY = 'weather_search_history';

// Track search IDs that are pending deletion from backend
// This prevents deleted searches from reappearing during sync
const pendingDeletions = new Set();

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
 * @throws {Error} If localStorage operations fail
 */
function addToLocalStorageCache(searchData) {
  try {
    const searches = getSearchHistory();
    searches.unshift(searchData);
    updateLocalStorageCache(searches);
  } catch (error) {
    console.error('Error adding to localStorage cache:', error);
    throw new Error(`Failed to save search to local storage: ${error.message}`);
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
 * Delete searches that have duplicate coordinates from localStorage only
 * Backend deletion is handled asynchronously
 * @param {Array} newCoordinates - New coordinate array
 * @param {string} excludeSearchId - Optional search ID to exclude from duplicate check
 * @returns {Array<string>} Array of duplicate search IDs that were removed
 */
function deleteDuplicateSearchesFromLocalStorage(newCoordinates, excludeSearchId = null) {
  const duplicateIds = findDuplicateSearches(newCoordinates, excludeSearchId);

  if (duplicateIds.length === 0) {
    return [];
  }

  // Remove each duplicate from localStorage synchronously
  duplicateIds.forEach(searchId => {
    removeFromLocalStorageCache(searchId);
  });

  return duplicateIds;
}

/**
 * Save a search to appropriate storage based on membership tier
 * Uses hybrid sync/async approach: localStorage operations are synchronous,
 * backend operations are queued for background processing
 * @param {Object} searchData - The search data to save
 * @param {string} membershipTier - User's membership tier
 * @param {string} originalSearchId - Optional ID of original search being replaced (for redo/edit)
 * @returns {Promise<boolean>} Success status
 */
export async function saveSearch(searchData, membershipTier, originalSearchId = null) {
  // STEP 1: SYNCHRONOUS - Handle localStorage duplicates immediately (fast!)
  const duplicateIds = deleteDuplicateSearchesFromLocalStorage(
    searchData.coordinates,
    originalSearchId
  );

  // STEP 2: SYNCHRONOUS - Remove original search from localStorage if editing
  if (originalSearchId) {
    removeFromLocalStorageCache(originalSearchId);
  }

  if (!isPremiumTier(membershipTier)) {
    // Free tier: use localStorage only with 3 search limit
    return saveSearchToHistory(searchData, 'free');
  }

  // STEP 3: SYNCHRONOUS - Add to localStorage cache immediately (UI depends on this!)
  addToLocalStorageCache(searchData);

  // STEP 4: ASYNCHRONOUS - Queue backend operations (doesn't block navigation!)

  // Mark duplicates and original as pending deletion
  duplicateIds.forEach(id => pendingDeletions.add(id));
  if (originalSearchId) {
    pendingDeletions.add(originalSearchId);
  }

  syncQueue.enqueue(async () => {
    // Delete duplicates from backend
    for (const dupId of duplicateIds) {
      try {
        await deleteSearchFromBackend(dupId);
        // Remove from pending deletions on success
        pendingDeletions.delete(dupId);
      } catch (error) {
        // Already removed from localStorage, backend delete is best-effort
        if (!error.message?.includes('404')) {
          console.error(`[SyncQueue] Failed to delete duplicate ${dupId} from backend:`, error);
        }
        // Remove from pending even on error (it's gone or doesn't exist)
        pendingDeletions.delete(dupId);
      }
    }

    // Delete original from backend if editing
    if (originalSearchId) {
      try {
        await deleteSearchFromBackend(originalSearchId);
        // Remove from pending deletions on success
        pendingDeletions.delete(originalSearchId);
      } catch (error) {
        if (!error.message?.includes('404')) {
          console.error(`[SyncQueue] Failed to delete original ${originalSearchId} from backend:`, error);
        }
        // Remove from pending even on error (it's gone or doesn't exist)
        pendingDeletions.delete(originalSearchId);
      }
    }

    // Save new search to backend
    await saveSearchToBackend(searchData);
  });

  // Return immediately after localStorage operations
  return true;
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
 * Merges backend data with local-only searches to avoid losing pending syncs
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
    const backendSearches = response.searches || [];

    // Get current localStorage to preserve searches that haven't synced yet
    const localSearches = getSearchHistory();

    // Create a map of backend search IDs for fast lookup
    const backendIds = new Set(backendSearches.map(s => s.id));

    // Find local searches that aren't in backend yet (pending sync)
    const localOnlySearches = localSearches.filter(s => !backendIds.has(s.id));

    // Filter out searches that are pending deletion from backend
    // This prevents deleted searches from reappearing during sync
    const filteredBackendSearches = backendSearches.filter(s => !pendingDeletions.has(s.id));

    // Merge: local-only searches + filtered backend searches
    const mergedSearches = [...localOnlySearches, ...filteredBackendSearches];

    // Update localStorage cache with merged data
    updateLocalStorageCache(mergedSearches);

    return mergedSearches;
  } catch (error) {
    console.error('Error syncing searches from backend:', error);
    // Return cached data on error
    return getSearchHistory();
  }
}

/**
 * Delete a specific search
 * Uses hybrid sync/async approach: localStorage deletion is synchronous,
 * backend deletion is queued for background processing
 * @param {string} searchId - The search ID to delete
 * @param {string} membershipTier - User's membership tier
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSearch(searchId, membershipTier) {
  // SYNCHRONOUS - Remove from localStorage immediately
  removeFromLocalStorageCache(searchId);

  if (!isPremiumTier(membershipTier)) {
    // Free tier: localStorage only, we're done
    return true;
  }

  // Mark as pending deletion to prevent reappearing during sync
  pendingDeletions.add(searchId);

  // ASYNCHRONOUS - Queue backend deletion (doesn't block UI)
  syncQueue.enqueue(async () => {
    try {
      await deleteSearchFromBackend(searchId);
      // Remove from pending deletions on success
      pendingDeletions.delete(searchId);
    } catch (error) {
      // If it's a 404, the search doesn't exist in backend - that's fine
      if (!error.message?.includes('404')) {
        console.error(`[SyncQueue] Failed to delete search ${searchId} from backend:`, error);
      }
      // Remove from pending even on error (it's gone or doesn't exist)
      pendingDeletions.delete(searchId);
    }
  });

  // Return immediately after localStorage operation
  return true;
}

/**
 * Clear all searches
 * Uses hybrid sync/async approach: localStorage clearing is synchronous,
 * backend clearing is queued for background processing
 * @param {string} membershipTier - User's membership tier
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllSearches(membershipTier) {
  // SYNCHRONOUS - Clear localStorage immediately
  clearSearchHistoryLocal();

  if (!isPremiumTier(membershipTier)) {
    // Free tier: localStorage only, we're done
    return true;
  }

  // ASYNCHRONOUS - Queue backend clearing (doesn't block UI)
  syncQueue.enqueue(async () => {
    try {
      await clearAllSearchesFromBackend();
    } catch (error) {
      console.error('[SyncQueue] Failed to clear searches from backend:', error);
      // Don't throw - searches are already cleared from localStorage
    }
  });

  // Return immediately after localStorage operation
  return true;
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

/**
 * Get debug information about pending operations
 * Useful for troubleshooting sync issues
 * @returns {Object} Debug information
 */
export function getDebugInfo() {
  return {
    pendingDeletions: Array.from(pendingDeletions),
    pendingDeletionCount: pendingDeletions.size,
    localSearchCount: getSearchHistory().length,
    syncQueueStatus: typeof window !== 'undefined' && window.getSyncQueueStatus
      ? window.getSyncQueueStatus()
      : null
  };
}

// Expose debug info globally for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.getSearchDebugInfo = getDebugInfo;
}
