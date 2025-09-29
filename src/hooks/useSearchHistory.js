import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'weather_search_field_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Custom hook for managing field-specific search history
 * @param {string} fieldKey - Unique key for this field's history (e.g., 'latitudeHistory')
 * @returns {Object} History management functions and data
 */
export const useSearchHistory = (fieldKey) => {
  const [history, setHistory] = useState([]);
  
  // Load history from localStorage on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(parsed[fieldKey] || []);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        setHistory([]);
      }
    };
    
    loadHistory();
  }, [fieldKey]);
  
  // Add entry to history
  const addToHistory = useCallback((value, context = null, coordinates = null) => {
    if (!value || value.trim() === '') return;
    
    const entry = {
      value: value.trim(),
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(coordinates && { coordinates })
    };
    
    setHistory(prevHistory => {
      // Remove existing entry with same value (case-insensitive)
      const filtered = prevHistory.filter(item => 
        item.value.toLowerCase() !== entry.value.toLowerCase()
      );
      
      // Add new entry at the beginning
      const newHistory = [entry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allHistory = stored ? JSON.parse(stored) : {};
        allHistory[fieldKey] = newHistory;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return newHistory;
    });
  }, [fieldKey]);
  
  // Get filtered history based on input
  const getFilteredHistory = useCallback((filter = '') => {
    if (!filter.trim()) {
      // Show recent 5 when no filter (hybrid approach)
      return history.slice(0, 5);
    }
    
    const lowerFilter = filter.toLowerCase();
    return history.filter(entry => 
      entry.value.toLowerCase().includes(lowerFilter) ||
      (entry.context && entry.context.toLowerCase().includes(lowerFilter))
    );
  }, [history]);
  
  // Clear history for this field
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allHistory = stored ? JSON.parse(stored) : {};
      delete allHistory[fieldKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, [fieldKey]);
  
  // Get all history entries (for debugging/admin purposes)
  const getAllHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting all history:', error);
      return {};
    }
  }, []);
  
  return {
    history,
    addToHistory,
    getFilteredHistory,
    clearHistory,
    getAllHistory
  };
};

export default useSearchHistory;