/**
 * Calculate ride quality score based on weather conditions
 * Score ranges from 0-100 (100 = perfect riding conditions)
 */

/**
 * Extract numeric wind speed from string (e.g., "10 mph" -> 10)
 */
function extractWindSpeed(windSpeed) {
  if (!windSpeed || typeof windSpeed !== 'string') return 0;
  const match = windSpeed.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Score temperature (0-100)
 * Ideal: 60-75°F = 100
 * Acceptable: 50-85°F = 70-90
 * Poor: <40°F or >95°F = 0-30
 */
export function scoreTemperature(temp) {
  if (temp === null || temp === undefined) return 50;

  const t = Number(temp);

  // Perfect range
  if (t >= 60 && t <= 75) return 100;

  // Good range
  if (t >= 50 && t < 60) return 70 + ((t - 50) * 3); // 70-100
  if (t > 75 && t <= 85) return 100 - ((t - 75) * 3); // 100-70

  // Acceptable range
  if (t >= 40 && t < 50) return 40 + ((t - 40) * 3); // 40-70
  if (t > 85 && t <= 95) return 70 - ((t - 85) * 4); // 70-30

  // Poor conditions
  if (t < 40) return Math.max(0, 40 - ((40 - t) * 2)); // 0-40
  if (t > 95) return Math.max(0, 30 - ((t - 95) * 3)); // 30-0

  return 50;
}

/**
 * Score wind speed (0-100)
 * Ideal: 0-10mph = 100
 * Acceptable: 10-20mph = 60-90
 * Caution: 20-30mph = 30-60
 * Poor: >30mph = 0-30
 */
export function scoreWind(windSpeed) {
  if (!windSpeed) return 100;

  const speed = typeof windSpeed === 'string' ? extractWindSpeed(windSpeed) : Number(windSpeed);

  if (speed <= 10) return 100;
  if (speed <= 20) return 100 - ((speed - 10) * 4); // 100-60
  if (speed <= 30) return 60 - ((speed - 20) * 3); // 60-30
  return Math.max(0, 30 - ((speed - 30) * 1.5)); // 30-0
}

/**
 * Score precipitation probability (0-100)
 * Ideal: 0-10% = 100
 * Acceptable: 10-30% = 70-100
 * Caution: 30-50% = 40-70
 * Poor: >50% = 0-40
 */
export function scorePrecipitation(precip) {
  if (precip === null || precip === undefined) return 100;

  const p = Number(precip);

  if (p <= 10) return 100;
  if (p <= 30) return 100 - ((p - 10) * 1.5); // 100-70
  if (p <= 50) return 70 - ((p - 30) * 1.5); // 70-40
  return Math.max(0, 40 - ((p - 50) * 0.8)); // 40-0
}

/**
 * Calculate overall ride quality score
 * Weights: Temperature 30%, Wind 40%, Precipitation 30%
 */
export function calculateRideQuality(temperature, windSpeed, precipitation) {
  const tempScore = scoreTemperature(temperature);
  const windScore = scoreWind(windSpeed);
  const precipScore = scorePrecipitation(precipitation);

  // Weighted average
  const overall = (tempScore * 0.3) + (windScore * 0.4) + (precipScore * 0.3);

  return Math.round(overall);
}

/**
 * Get ride quality level and color
 * Returns { level: string, color: string, emoji: string }
 */
export function getRideQualityLevel(score) {
  if (score >= 85) {
    return {
      level: 'Excellent',
      color: '#4caf50', // green
      emoji: '✅',
      description: 'Perfect riding conditions'
    };
  }
  if (score >= 70) {
    return {
      level: 'Good',
      color: '#8bc34a', // light green
      emoji: '👍',
      description: 'Great for riding'
    };
  }
  if (score >= 55) {
    return {
      level: 'Fair',
      color: '#ffc107', // amber
      emoji: '⚠️',
      description: 'Acceptable conditions'
    };
  }
  if (score >= 40) {
    return {
      level: 'Caution',
      color: '#ff9800', // orange
      emoji: '⚠️',
      description: 'Use caution'
    };
  }
  return {
    level: 'Poor',
    color: '#f44336', // red
    emoji: '❌',
    description: 'Not recommended'
  };
}

/**
 * Get temperature color for charts
 */
export function getTemperatureColor(temp) {
  if (temp === null || temp === undefined) return '#999';
  const t = Number(temp);

  if (t < 40) return '#2196f3'; // blue - cold
  if (t < 60) return '#4fc3f7'; // light blue - cool
  if (t < 75) return '#66bb6a'; // green - perfect
  if (t < 85) return '#ffa726'; // orange - warm
  return '#ef5350'; // red - hot
}

/**
 * Get wind speed color for charts
 */
export function getWindColor(windSpeed) {
  const speed = typeof windSpeed === 'string' ? extractWindSpeed(windSpeed) : Number(windSpeed || 0);

  if (speed <= 10) return '#4caf50'; // green - calm
  if (speed <= 20) return '#8bc34a'; // light green - acceptable
  if (speed <= 30) return '#ffc107'; // amber - caution
  return '#f44336'; // red - dangerous
}

/**
 * Get precipitation color for charts
 */
export function getPrecipitationColor(precip) {
  const p = Number(precip || 0);

  if (p <= 10) return '#4caf50'; // green - dry
  if (p <= 30) return '#8bc34a'; // light green - low chance
  if (p <= 50) return '#ffc107'; // amber - moderate
  return '#f44336'; // red - high chance
}
