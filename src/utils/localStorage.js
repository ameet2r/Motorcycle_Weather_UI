const STORAGE_KEY = 'weather_search_history';

/**
 * Get all search history from localStorage
 * @returns {Array} Array of search objects
 */
export function getSearchHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.searches || [];
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
}

/**
 * Get a specific search by ID
 * @param {string} searchId - The search ID to find
 * @returns {Object|null} The search object or null if not found
 */
export function getSearchById(searchId) {
  const searches = getSearchHistory();
  return searches.find(search => search.id === searchId) || null;
}

/**
 * Save a new search to localStorage
 * @param {Object} searchData - The search data to save
 * @returns {boolean} Success status
 */
export function saveSearchToHistory(searchData) {
  try {
    const searches = getSearchHistory();
    
    // Add the new search at the beginning (most recent first)
    searches.unshift(searchData);
    
    // Keep only the last 50 searches to prevent localStorage bloat
    const trimmedSearches = searches.slice(0, 50);
    
    const dataToSave = {
      searches: trimmedSearches
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving search to history:', error);
    return false;
  }
}

/**
 * Clear all search history
 * @returns {boolean} Success status
 */
export function clearSearchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
}

/**
 * Generate a unique ID for a search
 * @returns {string} Unique ID
 */
export function generateSearchId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}