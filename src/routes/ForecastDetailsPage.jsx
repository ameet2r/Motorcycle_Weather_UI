import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Paper,
  Alert,
  Grid,
  Divider,
  Avatar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HeightIcon from "@mui/icons-material/Height";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getSearchById } from "../utils/localStorage";
import {
  formatTemperatureRange,
  formatWindRange,
  formatPrecipitationRange,
  formatDateWithRelativeDay,
} from "../utils/forecastSummary";

export default function ForecastDetailsPage() {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());

  useEffect(() => {
    loadSearchDetails();
  }, [searchId]);

  const loadSearchDetails = () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchData = getSearchById(searchId);
      if (!searchData) {
        setError('Search not found. It may have been deleted or expired.');
      } else {
        setSearch(searchData);
      }
    } catch (err) {
      console.error('Error loading search details:', err);
      setError('Failed to load search details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/previous-searches');
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPeriodTime = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Time not available';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${end.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } catch {
      return `${startTime} - ${endTime}`;
    }
  };

  const createPeriodToDateMapping = (periods) => {
    const mapping = {};
    periods.forEach((period, index) => {
      if (period.start_time) {
        try {
          const startDate = new Date(period.start_time);
          // Use local date instead of UTC to avoid timezone shifts
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`; // YYYY-MM-DD format in local time
          if (!mapping[dateKey]) {
            mapping[dateKey] = [];
          }
          mapping[dateKey].push(index);
        } catch (error) {
          console.warn('Invalid date format in period:', period.start_time);
        }
      }
    });
    return mapping;
  };

  const handleDayClick = (selectedDate, coordIndex) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(selectedDate)) {
      newExpandedDays.delete(selectedDate);
    } else {
      newExpandedDays.add(selectedDate);
    }
    setExpandedDays(newExpandedDays);
  };

  if (loading) {
    return (
      <Box className="fade-in">
        <Stack spacing={3}>
          {/* Back Button Skeleton */}
          <Skeleton variant="rectangular" width={200} height={36} sx={{ borderRadius: 1 }} />
          
          {/* Header Skeleton */}
          <Box>
            <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={400} height={24} />
          </Box>
          
          {/* Content Skeleton */}
          {[1, 2].map((item) => (
            <Paper key={item} sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={200} height={24} />
                    <Skeleton variant="text" width={150} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  if (error || !search) {
    return (
      <Box className="fade-in">
        <Stack spacing={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
            variant="outlined"
            sx={{
              alignSelf: 'flex-start',
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Back to Previous Searches
          </Button>
          <Alert
            severity="error"
            sx={{ borderRadius: 2, p: 3 }}
          >
            <Typography variant="h6" gutterBottom>
              {error ? 'Error Loading Forecast' : 'Search Not Found'}
            </Typography>
            <Typography variant="body2">
              {error || 'The requested search could not be found. It may have been deleted or expired.'}
            </Typography>
          </Alert>
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Stack spacing={4}>
        {/* Navigation */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          variant="outlined"
          sx={{
            alignSelf: 'flex-start',
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateX(-4px)'
            }
          }}
        >
          Back to Previous Searches
        </Button>

        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Forecast Details
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Search from {formatDateTime(search.timestamp)}
          </Typography>
          <Chip
            label={`${search.coordinates.length} location${search.coordinates.length > 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Location Forecasts */}
        <Stack spacing={4}>
          {search.coordinates.map((coord, coordIndex) => (
            <Fade in={true} key={coordIndex}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Location Header */}
                  <Box
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Grid container spacing={3} alignItems="center">
                      <Grid>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Grid>
                      <Grid size="grow">
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, fontFamily: 'monospace' }}>
                          {coord.latitude}, {coord.longitude}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<HeightIcon />}
                            label={`${coord.elevation} ft elevation`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<CalendarTodayIcon />}
                            label={`${coord.summary.dayCount} days`}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`${coord.summary.totalPeriods} periods`}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Daily Summaries */}
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Daily Weather Summary
                    </Typography>
                    <Stack spacing={2}>
                      {Object.entries(coord.summary.dailySummaries)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, daySummary]) => {
                          const periodMapping = createPeriodToDateMapping(coord.periods);
                          const periodIndices = periodMapping[date];
                          const periods = periodIndices ? periodIndices.map(i => coord.periods[i]) : [];
                          return (
                            <Accordion
                              key={date}
                              expanded={expandedDays.has(date)}
                              onChange={() => handleDayClick(date, coordIndex)}
                              sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                  borderColor: 'primary.main',
                                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
                                }
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                onClick={() => handleDayClick(date, coordIndex)}
                                sx={{
                                  borderRadius: 2,
                                  '&.Mui-expanded': {
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0
                                  },
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'action.hover'
                                  }
                                }}
                              >
                                <Box sx={{ width: '100%' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    {formatDateWithRelativeDay(date)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                    {daySummary.periodCount} forecast periods
                                  </Typography>

                                  <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ThermostatIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                      <Typography variant="body2">
                                        <strong>Temperature:</strong> {formatTemperatureRange(daySummary.tempRange)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AirIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                      <Typography variant="body2">
                                        <strong>Wind:</strong> {formatWindRange(daySummary.windRange)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <WaterDropIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                      <Typography variant="body2">
                                        <strong>Precipitation:</strong> {formatPrecipitationRange(daySummary.precipRange)}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 0 }}>
                                <Grid container spacing={2}>
                                  {periods.map((period, idx) => (
                                    <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                      <Paper
                                        sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          backgroundColor: 'background.paper'
                                        }}
                                      >
                                        <Stack spacing={1}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {formatPeriodTime(period.start_time, period.end_time)}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ThermostatIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                            <Typography variant="body2">{period.temperature}°F</Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AirIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                                            <Typography variant="body2">{period.wind_direction} {period.wind_speed}</Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WaterDropIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                            <Typography variant="body2">{period.probability_of_precip ?? 0}% chance</Typography>
                                          </Box>
                                          {period.short_forecast && (
                                            <Typography variant="body2" color="text.secondary">
                                              {period.short_forecast}
                                            </Typography>
                                          )}
                                          {period.detailed_forecast && (
                                            <Typography variant="body2" color="text.secondary">
                                              {period.detailed_forecast}
                                            </Typography>
                                          )}
                                        </Stack>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}