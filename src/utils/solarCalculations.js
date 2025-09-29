import SunCalc from 'suncalc';
import { formatTime, formatSolarTimeRange as formatSolarTimeRangeUtil } from './dateTimeFormatters.js';

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
    // Use local timezone noon to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    
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
    
    // Create goldenHours object if we have sunrise and sunset
    let goldenHours = null;
    if (sunTimes.sunrise && sunTimes.sunset) {
      // Calculate golden hour times manually using correct definitions
      // Morning golden hour: 1 hour after sunrise
      // Evening golden hour: 1 hour before sunset
      const morningGoldenEnd = new Date(sunTimes.sunrise.getTime() + 60 * 60 * 1000); // 1 hour after sunrise
      const eveningGoldenStart = new Date(sunTimes.sunset.getTime() - 60 * 60 * 1000); // 1 hour before sunset
      
      goldenHours = {
        morning: {
          start: sunTimes.sunrise,
          end: morningGoldenEnd
        },
        evening: {
          start: eveningGoldenStart,
          end: sunTimes.sunset
        }
      };
    }
    
    const solarInfo = {
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      solarNoon: sunTimes.solarNoon,
      dawn: sunTimes.dawn,
      dusk: sunTimes.dusk,
      goldenHours: goldenHours,
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
 * Format time for display in 24-hour format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string (e.g., "06:23")
 */
export function formatSolarTime(date) {
  return formatTime(date);
}

/**
 * Format solar time range for golden hours
 * @param {Object} timeRange - Object with start and end Date objects
 * @returns {string} Formatted time range string
 */
export function formatSolarTimeRange(timeRange) {
  return formatSolarTimeRangeUtil(timeRange);
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
  
  // Include combined golden hours in summary - be more lenient with validation
  if (solarInfo.goldenHours && solarInfo.goldenHours.morning && solarInfo.goldenHours.evening) {
    const morningTime = formatSolarTimeRange(solarInfo.goldenHours.morning);
    const eveningTime = formatSolarTimeRange(solarInfo.goldenHours.evening);
    
    // Only add if we got valid formatted times
    if (morningTime !== 'N/A' && eveningTime !== 'N/A') {
      events.push({
        label: 'Golden Hours',
        time: `${morningTime} & ${eveningTime}`,
        type: 'goldenHours',
        rawTime: solarInfo.goldenHours
      });
    }
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
  
  // Combined Golden Hours
  if (solarInfo.goldenHours && solarInfo.goldenHours.morning && solarInfo.goldenHours.evening) {
    const morningTime = formatSolarTimeRange(solarInfo.goldenHours.morning);
    const eveningTime = formatSolarTimeRange(solarInfo.goldenHours.evening);
    
    // Only add if we got valid formatted times
    if (morningTime !== 'N/A' && eveningTime !== 'N/A') {
      events.push({
        label: 'Golden Hours',
        time: `${morningTime} & ${eveningTime}`,
        type: 'goldenHours',
        rawTime: solarInfo.goldenHours
      });
    }
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