import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
  Tooltip,
  ClickAwayListener,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import OpacityIcon from '@mui/icons-material/Opacity';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import { formatTime, formatDateTime as formatDateTimeUtil } from '../../utils/dateTimeFormatters';
import { getRideScore } from '../../utils/rideQuality';

/**
 * Extract numeric wind speed from string
 */
function extractWindSpeed(windSpeed) {
  if (!windSpeed || typeof windSpeed !== 'string') return 0;
  const match = windSpeed.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Extract numeric wind gust from string
 */
function extractWindGust(windGust) {
  if (!windGust || typeof windGust !== 'string') return null;
  const match = windGust.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * Custom tooltip for charts
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 3,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          {data.fullTime}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{ display: 'block', color: entry.color, fontWeight: 500 }}
          >
            {entry.name}: {entry.value}{entry.unit}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
}

/**
 * ForecastCharts - Interactive charts for temperature, wind, and precipitation
 */
export default function ForecastCharts({ periods, solarInfo }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(true);
  const [chartType, setChartType] = useState('all'); // 'all', 'temp', 'wind', 'precip', 'ride'
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!periods || periods.length === 0) {
    return null;
  }

  // Prepare data for charts
  const chartData = periods.map((period) => ({
    time: formatTime(period.start_time),
    fullTime: formatDateTimeUtil(period.start_time),
    temperature: period.temperature,
    windSpeed: extractWindSpeed(period.wind_speed),
    windGust: extractWindGust(period.wind_gust),
    windDirection: period.wind_direction,
    precipitation: period.probability_of_precip ?? 0,
    rideScore: Math.round(getRideScore(period)),
    humidity: period.humidity != null && period.humidity !== '' ? Number(period.humidity) : null,
    visibility: period.visibility != null && period.visibility !== '' ? Number(period.visibility) : null,
    apparentTemp: period.apparent_temperature != null && period.apparent_temperature !== '' ? Number(period.apparent_temperature) : null,
    timestamp: new Date(period.start_time).getTime(),
  }));

  // Calculate chart domain ranges
  const temps = chartData.map(d => d.temperature);
  const tempMin = Math.min(...temps);
  const tempMax = Math.max(...temps);
  const tempRange = tempMax - tempMin;
  const tempDomainMin = Math.floor(tempMin - tempRange * 0.1);
  const tempDomainMax = Math.ceil(tempMax + tempRange * 0.1);

  const winds = chartData.map(d => d.windSpeed);
  const gusts = chartData.map(d => d.windGust).filter(g => g !== null);
  const hasGustData = gusts.length > 0;
  const windMax = Math.max(...winds, ...(gusts.length > 0 ? gusts : [0]));
  const windDomainMax = Math.ceil(windMax * 1.2);

  // Check availability of new gridpoint fields
  const humidityValues = chartData.map(d => d.humidity).filter(v => v !== null);
  const hasHumidityData = humidityValues.length > 0;

  const visibilityValues = chartData.map(d => d.visibility).filter(v => v !== null);
  const hasVisibilityData = visibilityValues.length > 0;
  const visMax = hasVisibilityData ? Math.max(...visibilityValues) : 10;
  const visDomainMax = Math.ceil(visMax * 1.2);

  const apparentTempValues = chartData.map(d => d.apparentTemp).filter(v => v !== null);
  const hasApparentTempData = apparentTempValues.length > 0;
  const atMin = hasApparentTempData ? Math.min(...apparentTempValues) : tempMin;
  const atMax = hasApparentTempData ? Math.max(...apparentTempValues) : tempMax;
  const combinedTempMin = Math.min(tempMin, atMin);
  const combinedTempMax = Math.max(tempMax, atMax);
  const combinedTempRange = combinedTempMax - combinedTempMin;
  const apparentTempDomainMin = Math.floor(combinedTempMin - combinedTempRange * 0.1);
  const apparentTempDomainMax = Math.ceil(combinedTempMax + combinedTempRange * 0.1);

  // Get sunrise/sunset times if available
  const sunrise = solarInfo?.sunrise ? new Date(solarInfo.sunrise).getTime() : null;
  const sunset = solarInfo?.sunset ? new Date(solarInfo.sunset).getTime() : null;

  // Get current time for "Now" reference line
  const now = new Date().getTime();

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const chartHeight = isMobile ? 200 : 250;

  // Tooltip content for info icon
  const tooltipContent = (
    <Box sx={{ maxWidth: 350 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Chart Legend
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        The charts show weather trends over time with the following indicators:
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1, fontSize: '0.875rem' }}>
        <li><strong style={{ color: theme.palette.primary.main }}>Blue Vertical Line:</strong> Current time ("Now")</li>
        <li><strong style={{ color: '#ffa726' }}>🌅 Orange Dashed Line:</strong> Sunrise time</li>
        <li><strong style={{ color: '#7e57c2' }}>🌇 Purple Dashed Line:</strong> Sunset time</li>
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Wind Speed Reference Lines:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1, fontSize: '0.875rem' }}>
        <li><strong>Yellow (20mph):</strong> Caution - Windy conditions</li>
        <li><strong>Red (30mph):</strong> Unsafe - Strong winds</li>
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Precipitation Reference Lines:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1, fontSize: '0.875rem' }}>
        <li><strong>Yellow (30%):</strong> Moderate chance of rain</li>
        <li><strong>Red (50%):</strong> High chance of rain</li>
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Ride Quality Reference Lines:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1, fontSize: '0.875rem' }}>
        <li><strong>Green (80):</strong> Excellent threshold</li>
        <li><strong>Red (50):</strong> Poor threshold</li>
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Humidity Reference Lines:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1, fontSize: '0.875rem' }}>
        <li><strong>Yellow (60%):</strong> Getting uncomfortable</li>
        <li><strong>Red (80%):</strong> Very humid</li>
      </Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Visibility Reference Lines:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.875rem' }}>
        <li><strong>Red (3mi):</strong> Poor visibility</li>
        <li><strong>Yellow (7mi):</strong> Moderate visibility</li>
      </Box>
    </Box>
  );

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header with expand/collapse */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChartIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Forecast Trends
          </Typography>
          <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
            <Tooltip
              title={tooltipContent}
              arrow
              placement={isMobile ? 'bottom' : 'right'}
              open={tooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                    '& .MuiTooltip-arrow': {
                      color: 'background.paper',
                      '&::before': {
                        border: '1px solid',
                        borderColor: 'divider',
                      }
                    }
                  }
                }
              }}
            >
              <IconButton
                size="small"
                sx={{ p: 0.5 }}
                onClick={() => setTooltipOpen(!tooltipOpen)}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          </ClickAwayListener>
        </Box>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s',
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Chart type selector */}
        {!isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              sx={{ backgroundColor: 'background.paper' }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="temp">Temperature</ToggleButton>
              <ToggleButton value="wind">Wind</ToggleButton>
              <ToggleButton value="precip">Precipitation</ToggleButton>
              <ToggleButton value="ride">Ride Quality</ToggleButton>
              {hasHumidityData && <ToggleButton value="humidity">Humidity</ToggleButton>}
              {hasVisibilityData && <ToggleButton value="visibility">Visibility</ToggleButton>}
              {hasApparentTempData && <ToggleButton value="feelslike">Feels Like</ToggleButton>}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Temperature Chart */}
        {(chartType === 'all' || chartType === 'temp') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ThermostatIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Temperature (°F)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#4ecdc4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#45b7d1" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[tempDomainMin, tempDomainMax]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                {sunrise && (
                  <ReferenceLine
                    x={sunrise}
                    stroke="#ffa726"
                    strokeDasharray="3 3"
                    label={{ value: '🌅', position: 'top' }}
                  />
                )}
                {sunset && (
                  <ReferenceLine
                    x={sunset}
                    stroke="#7e57c2"
                    strokeDasharray="3 3"
                    label={{ value: '🌇', position: 'top' }}
                  />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{
                    value: 'Now',
                    position: 'top',
                    fill: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  fill="url(#tempGradient)"
                  name="Temperature"
                  unit="°F"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Wind Chart */}
        {(chartType === 'all' || chartType === 'wind') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AirIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Wind Speed{hasGustData ? ' & Gusts' : ''} (mph)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[0, windDomainMax]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                {hasGustData && (
                  <Legend
                    wrapperStyle={{
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      paddingTop: '10px'
                    }}
                  />
                )}
                <ReferenceLine
                  y={20}
                  stroke="#ffc107"
                  strokeDasharray="5 5"
                  label={{ value: 'Caution', position: 'right', fill: '#ffc107', fontSize: 12 }}
                />
                <ReferenceLine
                  y={30}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: 'Unsafe', position: 'right', fill: '#f44336', fontSize: 12 }}
                />
                {sunrise && (
                  <ReferenceLine
                    x={sunrise}
                    stroke="#ffa726"
                    strokeDasharray="3 3"
                    label={{ value: '🌅', position: 'top' }}
                  />
                )}
                {sunset && (
                  <ReferenceLine
                    x={sunset}
                    stroke="#7e57c2"
                    strokeDasharray="3 3"
                    label={{ value: '🌇', position: 'top' }}
                  />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{
                    value: 'Now',
                    position: 'top',
                    fill: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: 12
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="windSpeed"
                  stroke="#42a5f5"
                  strokeWidth={2}
                  dot={{ fill: '#42a5f5', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Wind Speed"
                  unit=" mph"
                />
                {hasGustData && (
                  <Line
                    type="monotone"
                    dataKey="windGust"
                    stroke="#00bcd4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#00bcd4', r: 2 }}
                    activeDot={{ r: 5 }}
                    name="Wind Gust"
                    unit=" mph"
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Precipitation Chart */}
        {(chartType === 'all' || chartType === 'precip') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WaterDropIcon sx={{ fontSize: 20, color: 'info.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Precipitation Probability (%)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#29b6f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#29b6f6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[0, 100]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={30}
                  stroke="#ffc107"
                  strokeDasharray="5 5"
                  label={{ value: 'Moderate', position: 'right', fill: '#ffc107', fontSize: 12 }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: 'High', position: 'right', fill: '#f44336', fontSize: 12 }}
                />
                {sunrise && (
                  <ReferenceLine
                    x={sunrise}
                    stroke="#ffa726"
                    strokeDasharray="3 3"
                    label={{ value: '🌅', position: 'top' }}
                  />
                )}
                {sunset && (
                  <ReferenceLine
                    x={sunset}
                    stroke="#7e57c2"
                    strokeDasharray="3 3"
                    label={{ value: '🌇', position: 'top' }}
                  />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{
                    value: 'Now',
                    position: 'top',
                    fill: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="precipitation"
                  stroke="#29b6f6"
                  strokeWidth={2}
                  fill="url(#precipGradient)"
                  name="Precipitation"
                  unit="%"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Ride Quality Chart */}
        {(chartType === 'all' || chartType === 'ride') && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SpeedIcon sx={{ fontSize: 20, color: '#4caf50' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Ride Quality Score (0-100)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="rideGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#ffc107" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f44336" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[0, 100]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={80}
                  stroke="#4caf50"
                  strokeDasharray="5 5"
                  label={{ value: 'Excellent', position: 'right', fill: '#4caf50', fontSize: 12 }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: 'Poor', position: 'right', fill: '#f44336', fontSize: 12 }}
                />
                {sunrise && (
                  <ReferenceLine
                    x={sunrise}
                    stroke="#ffa726"
                    strokeDasharray="3 3"
                    label={{ value: '\u{1F305}', position: 'top' }}
                  />
                )}
                {sunset && (
                  <ReferenceLine
                    x={sunset}
                    stroke="#7e57c2"
                    strokeDasharray="3 3"
                    label={{ value: '\u{1F307}', position: 'top' }}
                  />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{
                    value: 'Now',
                    position: 'top',
                    fill: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rideScore"
                  stroke="#4caf50"
                  strokeWidth={2}
                  fill="url(#rideGradient)"
                  name="Ride Score"
                  unit=""
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Humidity Chart */}
        {hasHumidityData && (chartType === 'all' || chartType === 'humidity') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <OpacityIcon sx={{ fontSize: 20, color: '#26c6da' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Relative Humidity (%)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#26c6da" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#26c6da" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[0, 100]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={60}
                  stroke="#ffc107"
                  strokeDasharray="5 5"
                  label={{ value: 'Uncomfortable', position: 'right', fill: '#ffc107', fontSize: 12 }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: 'Very Humid', position: 'right', fill: '#f44336', fontSize: 12 }}
                />
                {sunrise && (
                  <ReferenceLine x={sunrise} stroke="#ffa726" strokeDasharray="3 3" label={{ value: '\u{1F305}', position: 'top' }} />
                )}
                {sunset && (
                  <ReferenceLine x={sunset} stroke="#7e57c2" strokeDasharray="3 3" label={{ value: '\u{1F307}', position: 'top' }} />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{ value: 'Now', position: 'top', fill: theme.palette.primary.main, fontWeight: 'bold', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#26c6da"
                  strokeWidth={2}
                  fill="url(#humidityGradient)"
                  name="Humidity"
                  unit="%"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Visibility Chart */}
        {hasVisibilityData && (chartType === 'all' || chartType === 'visibility') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <VisibilityIcon sx={{ fontSize: 20, color: '#78909c' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Visibility (miles)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#78909c" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#78909c" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[0, visDomainMax]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={3}
                  stroke="#f44336"
                  strokeDasharray="5 5"
                  label={{ value: 'Poor', position: 'right', fill: '#f44336', fontSize: 12 }}
                />
                <ReferenceLine
                  y={7}
                  stroke="#ffc107"
                  strokeDasharray="5 5"
                  label={{ value: 'Moderate', position: 'right', fill: '#ffc107', fontSize: 12 }}
                />
                {sunrise && (
                  <ReferenceLine x={sunrise} stroke="#ffa726" strokeDasharray="3 3" label={{ value: '\u{1F305}', position: 'top' }} />
                )}
                {sunset && (
                  <ReferenceLine x={sunset} stroke="#7e57c2" strokeDasharray="3 3" label={{ value: '\u{1F307}', position: 'top' }} />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{ value: 'Now', position: 'top', fill: theme.palette.primary.main, fontWeight: 'bold', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="visibility"
                  stroke="#78909c"
                  strokeWidth={2}
                  fill="url(#visibilityGradient)"
                  name="Visibility"
                  unit=" mi"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Feels Like (Apparent Temperature) Chart */}
        {hasApparentTempData && (chartType === 'all' || chartType === 'feelslike') && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DeviceThermostatIcon sx={{ fontSize: 20, color: '#ef6c00' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Feels Like vs Actual Temperature (°F)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                  tickFormatter={(timestamp) => formatTime(new Date(timestamp).toISOString())}
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  interval={isMobile ? 'preserveStartEnd' : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}
                  domain={[apparentTempDomainMin, apparentTempDomainMax]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    paddingTop: '10px'
                  }}
                />
                {sunrise && (
                  <ReferenceLine x={sunrise} stroke="#ffa726" strokeDasharray="3 3" label={{ value: '\u{1F305}', position: 'top' }} />
                )}
                {sunset && (
                  <ReferenceLine x={sunset} stroke="#7e57c2" strokeDasharray="3 3" label={{ value: '\u{1F307}', position: 'top' }} />
                )}
                <ReferenceLine
                  x={now}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  label={{ value: 'Now', position: 'top', fill: theme.palette.primary.main, fontWeight: 'bold', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={{ fill: '#ff6b6b', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Actual"
                  unit="°F"
                />
                <Line
                  type="monotone"
                  dataKey="apparentTemp"
                  stroke="#ef6c00"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef6c00', r: 2 }}
                  activeDot={{ r: 5 }}
                  name="Feels Like"
                  unit="°F"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}
