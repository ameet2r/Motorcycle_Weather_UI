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
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import { formatTime, formatDateTime as formatDateTimeUtil } from '../../utils/dateTimeFormatters';

/**
 * Extract numeric wind speed from string
 */
function extractWindSpeed(windSpeed) {
  if (!windSpeed || typeof windSpeed !== 'string') return 0;
  const match = windSpeed.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
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
  const [chartType, setChartType] = useState('all'); // 'all', 'temp', 'wind', 'precip'

  if (!periods || periods.length === 0) {
    return null;
  }

  // Prepare data for charts
  const chartData = periods.map((period) => ({
    time: formatTime(period.start_time),
    fullTime: formatDateTimeUtil(period.start_time),
    temperature: period.temperature,
    windSpeed: extractWindSpeed(period.wind_speed),
    windDirection: period.wind_direction,
    precipitation: period.probability_of_precip ?? 0,
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
  const windMax = Math.max(...winds);
  const windDomainMax = Math.ceil(windMax * 1.2);

  // Get sunrise/sunset times if available
  const sunrise = solarInfo?.sunrise ? new Date(solarInfo.sunrise).getTime() : null;
  const sunset = solarInfo?.sunset ? new Date(solarInfo.sunset).getTime() : null;

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const chartHeight = isMobile ? 200 : 250;

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
                  dataKey="time"
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
                <Tooltip content={<CustomTooltip />} />
                {sunrise && (
                  <ReferenceLine
                    x={chartData.find(d => d.timestamp >= sunrise)?.time}
                    stroke="#ffa726"
                    strokeDasharray="3 3"
                    label={{ value: '🌅', position: 'top' }}
                  />
                )}
                {sunset && (
                  <ReferenceLine
                    x={chartData.find(d => d.timestamp >= sunset)?.time}
                    stroke="#7e57c2"
                    strokeDasharray="3 3"
                    label={{ value: '🌇', position: 'top' }}
                  />
                )}
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
                Wind Speed (mph)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="time"
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
                <Tooltip content={<CustomTooltip />} />
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
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Precipitation Chart */}
        {(chartType === 'all' || chartType === 'precip') && (
          <Box>
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
                  dataKey="time"
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
                <Tooltip content={<CustomTooltip />} />
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
      </Collapse>
    </Paper>
  );
}
