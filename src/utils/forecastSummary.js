import { calculateSolarInfo, getImportantSolarEvents, getAllSolarEvents } from './solarCalculations.js';

/**
 * Calculate temperature range from forecast periods
 * @param {Array} periods - Array of forecast periods
 * @returns {Object} Object with min and max temperatures
 */
export function calculateTemperatureRange(periods) {
  if (!periods || periods.length === 0) {
    return { min: null, max: null };
  }

  const temperatures = periods
    .map(period => period.temperature)
    .filter(temp => temp !== null && temp !== undefined && !isNaN(temp))
    .map(temp => Number(temp));

  if (temperatures.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...temperatures),
    max: Math.max(...temperatures)
  };
}

/**
 * Extract numeric value from wind speed string (e.g., "10 mph" -> 10)
 * @param {string} windSpeed - Wind speed string
 * @returns {number|null} Numeric wind speed or null if not found
 */
function extractWindSpeed(windSpeed) {
  if (!windSpeed || typeof windSpeed !== 'string') return null;
  
  const match = windSpeed.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * Calculate wind range from forecast periods
 * @param {Array} periods - Array of forecast periods
 * @returns {Object} Object with directions array and speeds object
 */
export function calculateWindRange(periods) {
  if (!periods || periods.length === 0) {
    return { directions: [], speeds: { min: null, max: null } };
  }

  const directions = new Set();
  const speeds = [];

  periods.forEach(period => {
    // Collect wind directions
    if (period.wind_direction && typeof period.wind_direction === 'string') {
      directions.add(period.wind_direction.trim());
    }

    // Collect wind speeds
    const speed = extractWindSpeed(period.wind_speed);
    if (speed !== null) {
      speeds.push(speed);
    }
  });

  const speedRange = speeds.length > 0 
    ? { min: Math.min(...speeds), max: Math.max(...speeds) }
    : { min: null, max: null };

  return {
    directions: Array.from(directions).sort(),
    speeds: speedRange
  };
}

/**
 * Calculate precipitation range from forecast periods
 * @param {Array} periods - Array of forecast periods
 * @returns {Object} Object with min and max precipitation percentages
 */
export function calculatePrecipitationRange(periods) {
  if (!periods || periods.length === 0) {
    return { min: null, max: null };
  }

  const precipValues = periods
    .map(period => period.probability_of_precip)
    .filter(precip => precip !== null && precip !== undefined && !isNaN(precip))
    .map(precip => Number(precip));

  if (precipValues.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...precipValues),
    max: Math.max(...precipValues)
  };
}

/**
 * Group periods by day based on start_time
 * @param {Array} periods - Array of forecast periods
 * @returns {Object} Object with date keys and period arrays as values
 */
export function groupPeriodsByDay(periods) {
  if (!periods || periods.length === 0) {
    return {};
  }

  const groupedPeriods = {};

  periods.forEach(period => {
    if (!period.start_time) return;

    try {
      const startDate = new Date(period.start_time);
      // Use local date instead of UTC to avoid timezone shifts
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`; // YYYY-MM-DD format in local time

      if (!groupedPeriods[dateKey]) {
        groupedPeriods[dateKey] = [];
      }

      groupedPeriods[dateKey].push(period);
    } catch (error) {
      console.warn('Invalid date format in period:', period.start_time);
    }
  });

  return groupedPeriods;
}

/**
 * Generate a complete summary for a coordinate's forecast data grouped by day
 * @param {Object} coordinateData - Forecast data for a single coordinate
 * @param {number} latitude - Latitude for solar calculations
 * @param {number} longitude - Longitude for solar calculations
 * @returns {Object} Summary object with daily summaries including solar data
 */
export function generateCoordinateSummary(coordinateData, latitude, longitude) {
  const { periods = [] } = coordinateData;
  
  const groupedPeriods = groupPeriodsByDay(periods);
  const dailySummaries = {};

  // Create summary for each day
  Object.entries(groupedPeriods).forEach(([date, dayPeriods]) => {
    // Calculate solar information for this date and location
    const solarInfo = calculateSolarInfo(
      parseFloat(latitude),
      parseFloat(longitude),
      date
    );

    dailySummaries[date] = {
      date,
      tempRange: calculateTemperatureRange(dayPeriods),
      windRange: calculateWindRange(dayPeriods),
      precipRange: calculatePrecipitationRange(dayPeriods),
      solarInfo: solarInfo,
      periodCount: dayPeriods.length
    };
  });

  return {
    dailySummaries,
    totalPeriods: periods.length,
    dayCount: Object.keys(dailySummaries).length
  };
}

/**
 * Format temperature range for display
 * @param {Object} tempRange - Temperature range object
 * @returns {string} Formatted temperature range
 */
export function formatTemperatureRange(tempRange) {
  if (tempRange.min === null || tempRange.max === null) {
    return 'N/A';
  }
  
  if (tempRange.min === tempRange.max) {
    return `${tempRange.min}°F`;
  }
  
  return `${tempRange.min}°F - ${tempRange.max}°F`;
}

/**
 * Format wind range for display
 * @param {Object} windRange - Wind range object
 * @returns {string} Formatted wind range
 */
export function formatWindRange(windRange) {
  const { directions, speeds } = windRange;
  
  if (speeds.min === null || speeds.max === null) {
    return 'N/A';
  }
  
  let directionStr = '';
  if (directions.length > 0) {
    if (directions.length === 1) {
      directionStr = directions[0];
    } else if (directions.length === 2) {
      directionStr = directions.join('-');
    } else {
      directionStr = `${directions[0]}-${directions[directions.length - 1]}`;
    }
    directionStr += ' ';
  }
  
  const speedStr = speeds.min === speeds.max 
    ? `${speeds.min} mph`
    : `${speeds.min}-${speeds.max} mph`;
  
  return `${directionStr}${speedStr}`;
}

/**
 * Format precipitation range for display
 * @param {Object} precipRange - Precipitation range object
 * @returns {string} Formatted precipitation range
 */
export function formatPrecipitationRange(precipRange) {
  if (precipRange.min === null || precipRange.max === null) {
    return 'N/A';
  }
  
  if (precipRange.min === precipRange.max) {
    return `${precipRange.min}%`;
  }
  
  return `${precipRange.min}% - ${precipRange.max}%`;
}

/**
 * Format solar information for summary display
 * @param {Object} solarInfo - Solar information object
 * @returns {Array} Array of formatted solar events for summary
 */
export function formatSolarInfoSummary(solarInfo) {
  if (!solarInfo) {
    return [];
  }
  
  return getImportantSolarEvents(solarInfo);
}

/**
 * Format solar information for detailed display
 * @param {Object} solarInfo - Solar information object
 * @returns {Array} Array of all formatted solar events
 */
export function formatSolarInfoDetailed(solarInfo) {
  if (!solarInfo) {
    return [];
  }
  
  return getAllSolarEvents(solarInfo);
}

/**
 * Get solar event color for Material-UI chips
 * @param {string} eventType - Type of solar event
 * @returns {string} Material-UI color name
 */
export function getSolarEventColor(eventType) {
  const colorMap = {
    sunrise: 'warning',
    sunset: 'error',
    solarNoon: 'info',
    dawn: 'secondary',
    dusk: 'secondary',
    goldenHourMorning: 'success',
    goldenHourEvening: 'success'
  };
  
  return colorMap[eventType] || 'default';
}

/**
 * Get solar event icon name for Material-UI icons
 * @param {string} eventType - Type of solar event
 * @returns {string} Icon component name
 */
export function getSolarEventIcon(eventType) {
  const iconMap = {
    sunrise: 'WbSunny',
    sunset: 'Brightness3',
    solarNoon: 'WbSunny',
    dawn: 'Brightness6',
    dusk: 'Brightness4',
    goldenHourMorning: 'WbTwilight',
    goldenHourEvening: 'WbTwilight'
  };
  
  return iconMap[eventType] || 'WbSunny';
}

/**
 * Format date with relative day names (Today, Tomorrow, etc.) and day of week
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
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

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (relativeDay) {
      return `${relativeDay} (${dayOfWeek}, ${formattedDate})`;
    } else {
      return `${dayOfWeek}, ${formattedDate}`;
    }
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return dateString;
  }
}