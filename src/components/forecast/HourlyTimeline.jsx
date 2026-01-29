import { useState } from 'react';
import { Box, Paper, Typography, Chip, useTheme, useMediaQuery, Tooltip, IconButton, ClickAwayListener } from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getRideScore, getRideQualityLevelV2 } from '../../utils/rideQuality';
import { formatTime } from '../../utils/dateTimeFormatters';

/**
 * Extract numeric wind speed from string
 */
function extractWindSpeed(windSpeed) {
  if (!windSpeed || typeof windSpeed !== 'string') return 0;
  const match = windSpeed.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Check if a period is currently active
 */
function isActivePeriod(startTime, endTime) {
  try {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  } catch {
    return false;
  }
}

/**
 * HourlyTimeline - Horizontal scrollable timeline showing ride quality for each hour
 */
export default function HourlyTimeline({ periods }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!periods || periods.length === 0) {
    return null;
  }

  const tooltipContent = (
    <Box sx={{ maxWidth: 350 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        ML-Powered Ride Quality
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Each hour is scored 0-100 using a machine learning model that evaluates temperature, wind, precipitation, visibility, humidity, and more.
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Quality Levels:</strong>
      </Typography>
      <Box component="ul" sx={{ pl: 2, m: 0, mb: 1.5, fontSize: '0.875rem' }}>
        <li>80-100: Excellent (Green)</li>
        <li>50-79: Fair (Amber)</li>
        <li>0-49: Poor (Red)</li>
      </Box>

      {/* Key/Legend */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'center',
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {[
          { level: 'Excellent', color: '#4caf50' },
          { level: 'Fair', color: '#ffc107' },
          { level: 'Poor', color: '#f44336' },
        ].map((item) => (
          <Chip
            key={item.level}
            label={item.level}
            size="small"
            variant="outlined"
            sx={{
              borderColor: item.color,
              color: item.color,
              fontSize: '0.7rem',
              height: '24px',
            }}
          />
        ))}
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
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Hourly Ride Quality
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

      {/* Horizontal scrollable container */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          },
        }}
      >
        {periods.map((period, index) => {
          const windSpeed = extractWindSpeed(period.wind_speed);
          const rideScore = getRideScore(period);
          const quality = getRideQualityLevelV2(rideScore);
          const isActive = isActivePeriod(period.start_time, period.end_time);
          const hourLabel = formatTime(period.start_time);

          return (
            <Box
              key={index}
              sx={{
                minWidth: isMobile ? '80px' : '100px',
              }}
            >
              <Paper
                elevation={isActive ? 4 : 1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : quality.color,
                  backgroundColor: isActive ? 'action.selected' : 'background.paper',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  position: 'relative',
                  boxShadow: isActive ? `0 0 12px ${quality.color}40` : undefined,
                }}
              >
                {/* Hour label */}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : 600,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                >
                  {hourLabel}
                </Typography>

                {/* Numeric ride score */}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    color: quality.color,
                    lineHeight: 1,
                  }}
                >
                  {Math.round(rideScore)}
                </Typography>

                {/* Temperature */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ThermostatIcon sx={{ fontSize: isMobile ? 12 : 14, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 600 }}>
                    {period.temperature}°
                  </Typography>
                </Box>

                {/* Wind */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AirIcon sx={{ fontSize: isMobile ? 12 : 14, color: 'secondary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 500 }}>
                    {windSpeed}mph
                  </Typography>
                </Box>

                {/* Precipitation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WaterDropIcon sx={{ fontSize: isMobile ? 12 : 14, color: 'info.main' }} />
                  <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 500 }}>
                    {period.probability_of_precip ?? 0}%
                  </Typography>
                </Box>

                {/* Ride quality level chip */}
                {!isMobile && (
                  <Chip
                    label={quality.level}
                    size="small"
                    sx={{
                      fontSize: '0.6rem',
                      height: '18px',
                      backgroundColor: quality.color,
                      color: '#fff',
                      fontWeight: 600,
                      '& .MuiChip-label': {
                        px: 0.75,
                      },
                    }}
                  />
                )}

                {/* Active indicator */}
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      boxShadow: `0 0 6px ${theme.palette.primary.main}`,
                    }}
                  />
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
