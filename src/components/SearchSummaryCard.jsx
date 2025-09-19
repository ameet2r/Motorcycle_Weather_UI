import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  CardActionArea,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  formatTemperatureRange,
  formatWindRange,
  formatPrecipitationRange,
  formatDateWithRelativeDay,
} from "../utils/forecastSummary";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LaunchIcon from '@mui/icons-material/Launch';

export default function SearchSummaryCard({ search, onClick }) {

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinates = (coordinates) => {
    return coordinates.map(coord => `${coord.latitude}, ${coord.longitude}`).join(' • ');
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
          transform: 'translateY(-4px)'
        }
      }}
      className="professional-card"
    >
      <CardActionArea
        onClick={() => onClick(search.id)}
        sx={{
          borderRadius: 3,
          '&:hover .launch-icon': {
            opacity: 1,
            transform: 'translateX(4px)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48
                  }}
                >
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {formatDateTime(search.timestamp)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {search.coordinates.length} location{search.coordinates.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Tooltip title="View Details">
                <IconButton
                  className="launch-icon"
                  sx={{
                    opacity: 0,
                    transition: 'all 0.2s ease-in-out',
                    color: 'primary.main'
                  }}
                >
                  <LaunchIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider />

            {/* Coordinates Overview */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                Coordinates Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {formatCoordinates(search.coordinates)}
              </Typography>
            </Box>

            {/* Location Details */}
            <Stack spacing={2}>
              {search.coordinates.map((coord, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {/* Location Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {coord.latitude}, {coord.longitude}
                    </Typography>
                    <Chip
                      label={`${coord.elevation} ft`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {coord.summary.dayCount} day{coord.summary.dayCount > 1 ? 's' : ''} • {coord.summary.totalPeriods} forecast periods
                  </Typography>
                  
                  {/* Daily Forecast Cards */}
                  <Stack spacing={1.5}>
                    {Object.entries(coord.summary.dailySummaries)
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                      .slice(0, 3) // Show only first 3 days for summary
                      .map(([date, daySummary]) => (
                        <Box
                          key={date}
                          sx={{
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {formatDateWithRelativeDay(date)}
                            <Chip
                              label={`${daySummary.periodCount} periods`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                            />
                          </Typography>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Tooltip title="Temperature Range">
                              <Chip
                                icon={<ThermostatIcon sx={{ fontSize: '14px !important' }} />}
                                label={formatTemperatureRange(daySummary.tempRange)}
                                size="small"
                                variant="filled"
                                color="primary"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px',
                                  '& .MuiChip-icon': { fontSize: 14 }
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Wind Speed Range">
                              <Chip
                                icon={<AirIcon sx={{ fontSize: '14px !important' }} />}
                                label={formatWindRange(daySummary.windRange)}
                                size="small"
                                variant="filled"
                                color="secondary"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px',
                                  '& .MuiChip-icon': { fontSize: 14 }
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Precipitation Chance">
                              <Chip
                                icon={<WaterDropIcon sx={{ fontSize: '14px !important' }} />}
                                label={formatPrecipitationRange(daySummary.precipRange)}
                                size="small"
                                variant="filled"
                                color="info"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: '24px',
                                  '& .MuiChip-icon': { fontSize: 14 }
                                }}
                              />
                            </Tooltip>
                          </Stack>
                        </Box>
                      ))}
                    
                    {/* Show more indicator if there are more days */}
                    {Object.keys(coord.summary.dailySummaries).length > 3 && (
                      <Box sx={{ textAlign: 'center', pt: 1 }}>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                          +{Object.keys(coord.summary.dailySummaries).length - 3} more days • Click to view all
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}