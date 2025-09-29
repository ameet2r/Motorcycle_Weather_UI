import SunCalc from 'suncalc';

/**
 * Calculate solar information for a specific date and location
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Object} Solar information object with all solar events
 */
export function calculateSolarInfo(latitude, longitude, dateString) {
  try {
    // Parse coordinates to ensure they are numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Parse the date string and create a Date object for the given day
    const date = new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone issues
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('Invalid coordinates for solar calculation:', { latitude, longitude, lat, lng });
      return null;
    }

    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for solar calculation:', dateString);
      return null;
    }


    // Get sun times for the date
    const sunTimes = SunCalc.getTimes(date, lat, lng);
    
    // Get sun position at solar noon for additional calculations
    const solarNoonPosition = SunCalc.getPosition(sunTimes.solarNoon, lat, lng);
    
    const solarInfo = {
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      solarNoon: sunTimes.solarNoon,
      dawn: sunTimes.dawn,
      dusk: sunTimes.dusk,
      goldenHourMorning: {
        start: sunTimes.goldenHour,
        end: sunTimes.sunrise
      },
      goldenHourEvening: {
        start: sunTimes.sunset,
        end: sunTimes.goldenHourEnd
      },
      // Additional useful information
      nauticalDawn: sunTimes.nauticalDawn,
      nauticalDusk: sunTimes.nauticalDusk,
      civilDawn: sunTimes.dawn,
      civilDusk: sunTimes.dusk,
      solarElevation: solarNoonPosition.altitude * 180 / Math.PI // Convert from radians to degrees
    };

    return solarInfo;
  } catch (error) {
    console.error('Error calculating solar information:', error, { latitude, longitude, dateString });
    return null;
  }
}

/**
 * Format time for display in local timezone
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string (e.g., "6:23 AM")
 */
export function formatSolarTime(date) {
  // Handle both Date objects and date strings
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    return 'N/A';
  }
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
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
  
  const startTime = formatSolarTime(timeRange.start);
  const endTime = formatSolarTime(timeRange.end);
  
  if (startTime === 'N/A' || endTime === 'N/A') {
    return 'N/A';
  }
  
  return `${startTime} - ${endTime}`;
}

/**
 * Get the most important solar events for summary display
 * @param {Object} solarInfo - Solar information object
 * @returns {Array} Array of important solar events with labels and times
 */
export function getImportantSolarEvents(solarInfo) {
  if (!solarInfo) {
    return [];
  }
  
  const events = [];
  
  // Always include sunrise and sunset as they're most important
  if (solarInfo.sunrise) {
    events.push({
      label: 'Sunrise',
      time: formatSolarTime(solarInfo.sunrise),
      type: 'sunrise',
      rawTime: solarInfo.sunrise
    });
  }
  
  if (solarInfo.sunset) {
    events.push({
      label: 'Sunset',
      time: formatSolarTime(solarInfo.sunset),
      type: 'sunset',
      rawTime: solarInfo.sunset
    });
  }
  
  return events;
}

/**
 * Get all solar events for detailed display
 * @param {Object} solarInfo - Solar information object
 * @returns {Array} Array of all solar events with labels and times
 */
export function getAllSolarEvents(solarInfo) {
  if (!solarInfo) {
    return [];
  }
  
  const events = [];
  
  // Dawn
  if (solarInfo.dawn) {
    events.push({
      label: 'Dawn',
      time: formatSolarTime(solarInfo.dawn),
      type: 'dawn',
      rawTime: solarInfo.dawn
    });
  }
  
  // Morning Golden Hour
  if (solarInfo.goldenHourMorning && solarInfo.goldenHourMorning.start) {
    events.push({
      label: 'Golden Hour (AM)',
      time: formatSolarTimeRange(solarInfo.goldenHourMorning),
      type: 'goldenHourMorning',
      rawTime: solarInfo.goldenHourMorning
    });
  }
  
  // Sunrise
  if (solarInfo.sunrise) {
    events.push({
      label: 'Sunrise',
      time: formatSolarTime(solarInfo.sunrise),
      type: 'sunrise',
      rawTime: solarInfo.sunrise
    });
  }
  
  // Solar Noon
  if (solarInfo.solarNoon) {
    events.push({
      label: 'Solar Noon',
      time: formatSolarTime(solarInfo.solarNoon),
      type: 'solarNoon',
      rawTime: solarInfo.solarNoon
    });
  }
  
  // Sunset
  if (solarInfo.sunset) {
    events.push({
      label: 'Sunset',
      time: formatSolarTime(solarInfo.sunset),
      type: 'sunset',
      rawTime: solarInfo.sunset
    });
  }
  
  // Evening Golden Hour
  if (solarInfo.goldenHourEvening && solarInfo.goldenHourEvening.start) {
    events.push({
      label: 'Golden Hour (PM)',
      time: formatSolarTimeRange(solarInfo.goldenHourEvening),
      type: 'goldenHourEvening',
      rawTime: solarInfo.goldenHourEvening
    });
  }
  
  // Dusk
  if (solarInfo.dusk) {
    events.push({
      label: 'Dusk',
      time: formatSolarTime(solarInfo.dusk),
      type: 'dusk',
      rawTime: solarInfo.dusk
    });
  }
  
  return events;
}

/**
 * Calculate solar information for multiple days
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @param {Array} dates - Array of date strings in YYYY-MM-DD format
 * @returns {Object} Object with date keys and solar info values
 */
export function calculateSolarInfoForDates(latitude, longitude, dates) {
  const solarData = {};
  
  dates.forEach(dateString => {
    const solarInfo = calculateSolarInfo(latitude, longitude, dateString);
    if (solarInfo) {
      solarData[dateString] = solarInfo;
    }
  });
  
  return solarData;
}