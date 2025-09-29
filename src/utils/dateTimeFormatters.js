/**
 * Centralized date and time formatting utilities
 * All dates will be in YYYY-MM-DD format
 * All times will be in 24-hour HH:MM format
 */

/**
 * Format a date to YYYY-MM-DD format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export function formatDate(date) {
  try {
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error formatting date:', date, error);
    return 'Invalid Date';
  }
}

/**
 * Format a time to 24-hour HH:MM format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted time string (HH:MM)
 */
export function formatTime(date) {
  try {
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.warn('Error formatting time:', date, error);
    return 'N/A';
  }
}

/**
 * Format a date and time to YYYY-MM-DD HH:MM format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted datetime string (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(date) {
  try {
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(date);
    
    if (formattedDate === 'Invalid Date' || formattedTime === 'N/A') {
      return 'Invalid DateTime';
    }
    
    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    console.warn('Error formatting datetime:', date, error);
    return 'Invalid DateTime';
  }
}

/**
 * Format date with relative day names (Today, Tomorrow, etc.) and YYYY-MM-DD format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string with relative day
 */
export function formatDateWithRelativeDay(dateString) {
  try {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Normalize dates to compare just the date part
    const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normalizedDate = normalizeDate(date);
    const normalizedToday = normalizeDate(today);
    const normalizedTomorrow = normalizeDate(tomorrow);
    const normalizedYesterday = normalizeDate(yesterday);

    let relativeDay = '';
    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      relativeDay = 'Today';
    } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
      relativeDay = 'Tomorrow';
    } else if (normalizedDate.getTime() === normalizedYesterday.getTime()) {
      relativeDay = 'Yesterday';
    }

    const formattedDate = formatDate(date);

    if (relativeDay) {
      return `${relativeDay} (${formattedDate})`;
    } else {
      return formattedDate;
    }
  } catch (error) {
    console.warn('Error formatting date with relative day:', dateString, error);
    return dateString;
  }
}

/**
 * Format time range for periods (start - end)
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {string} Formatted time range
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return 'Time not available';
  
  try {
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);
    
    if (formattedStart === 'N/A' || formattedEnd === 'N/A') {
      return `${startTime} - ${endTime}`;
    }
    
    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.warn('Error formatting time range:', startTime, endTime, error);
    return `${startTime} - ${endTime}`;
  }
}

/**
 * Format period time with date and time range
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {string} Formatted period time with date
 */
export function formatPeriodTime(startTime, endTime) {
  if (!startTime || !endTime) return 'Time not available';
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startDate = formatDate(start);
    const timeRange = formatTimeRange(start, end);
    
    return `${startDate} ${timeRange}`;
  } catch (error) {
    console.warn('Error formatting period time:', startTime, endTime, error);
    return `${startTime} - ${endTime}`;
  }
}

/**
 * Check if the current datetime falls within a forecast period's time range
 * @param {string|Date} startTime - Period start time
 * @param {string|Date} endTime - Period end time
 * @returns {boolean} True if current time is within the period range
 */
export function isCurrentPeriod(startTime, endTime) {
  if (!startTime || !endTime) {
    return false;
  }

  try {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    // Current time should be >= start and < end (inclusive start, exclusive end)
    return now >= start && now < end;
  } catch (error) {
    console.warn('Error checking current period:', startTime, endTime, error);
    return false;
  }
}

/**
 * Format solar time range for golden hours
 * @param {Object} timeRange - Object with start and end Date objects
 * @returns {string} Formatted time range string
 */
export function formatSolarTimeRange(timeRange) {
  if (!timeRange || !timeRange.start || !timeRange.end) {
    return 'N/A';
  }
  
  const startTime = formatTime(timeRange.start);
  const endTime = formatTime(timeRange.end);
  
  if (startTime === 'N/A' || endTime === 'N/A') {
    return 'N/A';
  }
  
  return `${startTime} - ${endTime}`;
}