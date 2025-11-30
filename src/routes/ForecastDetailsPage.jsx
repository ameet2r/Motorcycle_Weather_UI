import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Box,
  Chip,
  Paper,
  Alert,
  Grid,
  Avatar,
  Tooltip,
  Skeleton,
  Tabs,
  Tab,
  Collapse,
  IconButton,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HeightIcon from "@mui/icons-material/Height";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { getSearchByIdFromStorage } from "../utils/searchStorage";
import { useUser } from "../contexts/UserContext";
import {
  formatTemperatureRange,
  formatWindRange,
  formatPrecipitationRange,
  formatDateWithRelativeDay,
  formatSolarInfoDetailed,
  getSolarEventColor,
} from "../utils/forecastSummary";
import { formatDateTime, formatTime, isCurrentPeriod } from "../utils/dateTimeFormatters";
import HourlyTimeline from "../components/forecast/HourlyTimeline";
import ForecastCharts from "../components/forecast/ForecastCharts";
import { fetchWeatherAlerts } from "../utils/api";
import WarningIcon from "@mui/icons-material/Warning";

export default function ForecastDetailsPage() {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const { membershipTier } = useUser();
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("0");
  const [activeDayTabs, setActiveDayTabs] = useState({});
  const [expandedPeriods, setExpandedPeriods] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [alerts, setAlerts] = useState({});
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const [activeAlertTabs, setActiveAlertTabs] = useState({});

  useEffect(() => {
    loadSearchDetails();
  }, [searchId]);

  useEffect(() => {
    if (search) {
      loadAlerts();
    }
  }, [search]);

  const loadSearchDetails = () => {
    setLoading(true);
    setError(null);

    try {
      const searchData = getSearchByIdFromStorage(searchId, membershipTier);

      if (!searchData) {
        setError('Search not found. It may have been deleted or expired.');
        setLoading(false);
        return;
      }

      // Check if this search has local forecast data (periods array)
      // All coordinates must have periods to display forecast
      const hasForecastData = searchData.coordinates &&
        searchData.coordinates.length > 0 &&
        searchData.coordinates.every(coord =>
          coord.periods && Array.isArray(coord.periods) && coord.periods.length > 0
        );

      if (!hasForecastData) {
        // Cloud-only search - no local forecast data
        // This happens when search was created on another device
        setError('noForecastData');  // Special error state for redo UI
        setSearch(searchData);  // Still set search for metadata (coordinates, address)
        setLoading(false);
        return;
      }

      // Has full forecast data - proceed normally
      setSearch(searchData);

      // Initialize the first location's day tab and set the selected date
      const initialDayTabs = {};
      if (searchData.coordinates.length > 0) {
        const dates = Object.keys(searchData.coordinates[0].summary.dailySummaries).sort();
        if (dates.length > 0) {
          const firstDate = dates[0];
          initialDayTabs[0] = firstDate;
          setSelectedDate(firstDate);
        }
      }
      setActiveDayTabs(initialDayTabs);
    } catch (err) {
      console.error('Error loading search details:', err);
      setError('Failed to load search details.');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    setAlertsLoading(true);
    try {
      // Build coordinates array for API request
      const coordinates = search.coordinates.map(coord => ({
        latLng: {
          latitude: coord.latitude,
          longitude: coord.longitude
        }
      }));

      // Fetch alerts from backend
      const response = await fetchWeatherAlerts(coordinates);
      setAlerts(response.alerts || {});
    } catch (err) {
      console.error('Error loading weather alerts:', err);
      // Don't show error to user - alerts are supplementary information
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/previous-searches');
  };

  const handleRedoSearch = (search) => {
    // Navigate to PreviousSearchesPage and trigger redo
    // Pass search data as state so it can be automatically redone
    navigate('/previous-searches', {
      state: {
        redoSearchId: search.id,
        coordinates: search.coordinates
      }
    });
  };

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);

    // When switching locations, try to maintain the same calendar date
    const newLocationIndex = parseInt(newValue);
    if (search && search.coordinates[newLocationIndex] && selectedDate) {
      const newCoord = search.coordinates[newLocationIndex];
      const dates = Object.keys(newCoord.summary.dailySummaries).sort();

      // If this location doesn't have a selected day yet, set it based on current selected date
      if (!activeDayTabs[newLocationIndex] && dates.length > 0) {
        // Try to find the same date in the new location
        const dateToSet = dates.includes(selectedDate) ? selectedDate : dates[0];
        setActiveDayTabs(prev => ({
          ...prev,
          [newLocationIndex]: dateToSet
        }));
      }
    }
  };

  const handleDayTabChange = (locationIndex, newDayValue) => {
    setActiveDayTabs(prev => ({
      ...prev,
      [locationIndex]: newDayValue
    }));

    // Update the globally selected date so other locations will use this same date
    setSelectedDate(newDayValue);
  };

  const handleTogglePeriods = (coordIndex, date) => {
    const key = `${coordIndex}_${date}`;
    setExpandedPeriods(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleAlerts = (coordIndex) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [coordIndex]: !prev[coordIndex]
    }));
  };

  const handleAlertTabChange = (locationIndex, newAlertIndex) => {
    setActiveAlertTabs(prev => ({
      ...prev,
      [locationIndex]: newAlertIndex
    }));
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'error';
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'minor':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getCoordinateKey = (coord) => {
    return `${coord.latitude}:${coord.longitude}`;
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
            <Paper key={item} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
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

  // Special UI for cloud-only searches (no local forecast data)
  if (error === 'noForecastData' && search) {
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
            severity="info"
            sx={{ borderRadius: 2, p: 3 }}
          >
            <Typography variant="h6" gutterBottom>
              Forecast Data Not Available Locally
            </Typography>
            <Typography variant="body2" paragraph>
              This search was created on another device. To view the forecast, you'll need to fetch current weather data.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Search Locations:</strong>
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {search.coordinates.map((coord, idx) => (
                <Chip
                  key={idx}
                  icon={<LocationOnIcon />}
                  label={coord.address || `${coord.latitude}, ${coord.longitude}`}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleRedoSearch(search)}
              sx={{ mt: 2 }}
            >
              Redo Search to Fetch Current Weather
            </Button>
          </Alert>
        </Stack>
      </Box>
    );
  }

  // Error or search not found
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

        {/* Location Tabs */}
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                  px: 3,
                },
                '& .MuiTabs-scrollButtons': {
                  '&.Mui-disabled': { opacity: 0.3 }
                }
              }}
            >
              {search.coordinates.map((coord, coordIndex) => {
                const locationLabel = coord.address
                  ? coord.address.split(',')[0] // Get first part of address (usually city)
                  : `Location ${coordIndex + 1}`;
                return (
                  <Tab
                    key={coordIndex}
                    label={locationLabel}
                    value={String(coordIndex)}
                    icon={<LocationOnIcon />}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>
          </Box>

          {search.coordinates.map((coord, coordIndex) => (
            <TabPanel key={coordIndex} value={String(coordIndex)} sx={{ p: 0 }}>
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
                      p: { xs: 1.5, sm: 2 },
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
                          {coord.address ? `${coord.address} (${coord.latitude}, ${coord.longitude})` : `${coord.latitude}, ${coord.longitude}`}
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

                  {/* Weather Alerts Loading */}
                  {alertsLoading && (
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width={200} height={32} />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                      </Box>
                    </Box>
                  )}

                  {/* Weather Alerts Section */}
                  {!alertsLoading && alerts[getCoordinateKey(coord)] && alerts[getCoordinateKey(coord)].length > 0 && (
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color="warning" />
                          Active Weather Alerts ({alerts[getCoordinateKey(coord)].length})
                        </Typography>
                        <IconButton
                          onClick={() => handleToggleAlerts(coordIndex)}
                          size="small"
                          sx={{
                            transform: expandedAlerts[coordIndex] ? 'rotate(0deg)' : 'rotate(180deg)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          {expandedAlerts[coordIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedAlerts[coordIndex]} timeout="auto">
                        <TabContext value={activeAlertTabs[coordIndex] !== undefined ? String(activeAlertTabs[coordIndex]) : "0"}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs
                              value={activeAlertTabs[coordIndex] !== undefined ? String(activeAlertTabs[coordIndex]) : "0"}
                              onChange={(_e, newValue) => handleAlertTabChange(coordIndex, parseInt(newValue))}
                              variant="scrollable"
                              scrollButtons="auto"
                              allowScrollButtonsMobile
                              sx={{
                                '& .MuiTab-root': {
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  minHeight: 48,
                                  px: 2,
                                },
                                '& .MuiTabs-scrollButtons': {
                                  '&.Mui-disabled': { opacity: 0.3 }
                                }
                              }}
                            >
                              {alerts[getCoordinateKey(coord)].map((alert, alertIdx) => {
                                const properties = alert.properties || {};
                                const event = properties.event || 'Weather Alert';
                                const severity = properties.severity || 'Unknown';
                                const severityColor = getSeverityColor(severity);

                                return (
                                  <Tab
                                    key={alertIdx}
                                    label={event}
                                    value={String(alertIdx)}
                                    icon={<WarningIcon sx={{ fontSize: 16, color: severityColor === 'error' ? 'error.main' : severityColor === 'warning' ? 'warning.main' : 'info.main' }} />}
                                    iconPosition="start"
                                  />
                                );
                              })}
                            </Tabs>
                          </Box>

                          {alerts[getCoordinateKey(coord)].map((alert, alertIdx) => {
                            const properties = alert.properties || {};
                            const severity = properties.severity || 'Unknown';
                            const event = properties.event || 'Weather Alert';
                            const headline = properties.headline || event;
                            const description = properties.description || 'No details available';
                            const instruction = properties.instruction;
                            const onset = properties.onset ? new Date(properties.onset).toLocaleString() : null;
                            const expires = properties.expires ? new Date(properties.expires).toLocaleString() : null;
                            const severityColor = getSeverityColor(severity);

                            return (
                              <TabPanel key={alertIdx} value={String(alertIdx)} sx={{ p: 0 }}>
                                <Paper
                                  sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    borderRadius: 2,
                                    border: '2px solid',
                                    borderColor: severityColor === 'error' ? 'error.main' : severityColor === 'warning' ? 'warning.main' : 'info.main',
                                    backgroundColor: 'background.paper',
                                    boxShadow: severityColor === 'error' ? '0 0 8px rgba(211, 47, 47, 0.3)' : severityColor === 'warning' ? '0 0 8px rgba(237, 108, 2, 0.3)' : '0 0 8px rgba(2, 136, 209, 0.3)',
                                  }}
                                >
                                  <Stack spacing={1.5}>
                                    {/* Header with event and severity */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                      <WarningIcon sx={{ color: severityColor === 'error' ? 'error.main' : severityColor === 'warning' ? 'warning.main' : 'info.main' }} />
                                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                                        {event}
                                      </Typography>
                                      {severity && severity !== 'Unknown' && (
                                        <Chip
                                          label={severity}
                                          color={severityColor}
                                          size="small"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      )}
                                    </Box>

                                    {/* Headline if different from event */}
                                    {headline && headline !== event && (
                                      <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic' }}>
                                        {headline}
                                      </Typography>
                                    )}

                                    {/* Description */}
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
                                      {description}
                                    </Typography>

                                    {/* Instructions */}
                                    {instruction && (
                                      <Box
                                        sx={{
                                          mt: 1,
                                          p: 1.5,
                                          backgroundColor: severityColor === 'error' ? 'rgba(211, 47, 47, 0.05)' : severityColor === 'warning' ? 'rgba(237, 108, 2, 0.05)' : 'rgba(2, 136, 209, 0.05)',
                                          borderRadius: 1,
                                          borderLeft: '3px solid',
                                          borderLeftColor: severityColor === 'error' ? 'error.main' : severityColor === 'warning' ? 'warning.main' : 'info.main'
                                        }}
                                      >
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <WarningIcon sx={{ fontSize: 16 }} />
                                          Safety Instructions:
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
                                          {instruction}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Stack>
                                </Paper>
                              </TabPanel>
                            );
                          })}
                        </TabContext>
                      </Collapse>
                    </Box>
                  )}

                  {/* Day Tabs */}
                  <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
                    <TabContext value={activeDayTabs[coordIndex] || ""}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                          value={activeDayTabs[coordIndex] || ""}
                          onChange={(_e, newValue) => handleDayTabChange(coordIndex, newValue)}
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                          sx={{
                            '& .MuiTab-root': {
                              textTransform: 'none',
                              fontWeight: 500,
                              fontSize: '0.875rem',
                              minHeight: 48,
                              px: 2,
                            },
                            '& .MuiTabs-scrollButtons': {
                              '&.Mui-disabled': { opacity: 0.3 }
                            }
                          }}
                        >
                          {Object.entries(coord.summary.dailySummaries)
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date]) => (
                              <Tab
                                key={date}
                                label={formatDateWithRelativeDay(date)}
                                value={date}
                                icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                                iconPosition="start"
                              />
                            ))}
                        </Tabs>
                      </Box>

                      {Object.entries(coord.summary.dailySummaries)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, daySummary]) => {
                          const periodMapping = createPeriodToDateMapping(coord.periods);
                          const periodIndices = periodMapping[date];
                          const periods = periodIndices ? periodIndices.map(i => coord.periods[i]) : [];

                          return (
                            <TabPanel key={date} value={date} sx={{ p: 0 }}>
                              {/* Day Summary Card */}
                              <Paper
                                sx={{
                                  p: { xs: 1.5, sm: 2 },
                                  mb: 3,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(66, 165, 245, 0.03) 100%)',
                                  border: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                  Daily Summary
                                </Typography>
                                <Grid container spacing={3}>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ThermostatIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                          Temperature
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                          {formatTemperatureRange(daySummary.tempRange)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AirIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                          Wind
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                          {formatWindRange(daySummary.windRange)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <WaterDropIcon sx={{ fontSize: 20, color: 'info.main' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                          Precipitation
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                          {formatPrecipitationRange(daySummary.precipRange)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                </Grid>

                                {/* Solar Information */}
                                {daySummary.solarInfo && (
                                  <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                      Solar Information
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                      {formatSolarInfoDetailed(daySummary.solarInfo).map((solarEvent, solarIndex) => {
                                        const getSolarIcon = (eventType) => {
                                          switch (eventType) {
                                            case 'sunrise':
                                              return <WbSunnyIcon sx={{ fontSize: '14px !important' }} />;
                                            case 'sunset':
                                              return <Brightness3Icon sx={{ fontSize: '14px !important' }} />;
                                            case 'solarNoon':
                                              return <WbSunnyIcon sx={{ fontSize: '14px !important' }} />;
                                            case 'dawn':
                                              return <Brightness6Icon sx={{ fontSize: '14px !important' }} />;
                                            case 'dusk':
                                              return <Brightness4Icon sx={{ fontSize: '14px !important' }} />;
                                            case 'goldenHours':
                                              return <WbTwilightIcon sx={{ fontSize: '14px !important' }} />;
                                            default:
                                              return <WbSunnyIcon sx={{ fontSize: '14px !important' }} />;
                                          }
                                        };

                                        return (
                                          <Tooltip key={solarIndex} title={`${solarEvent.label}: ${solarEvent.time}`}>
                                            <Chip
                                              icon={getSolarIcon(solarEvent.type)}
                                              label={`${solarEvent.label}: ${solarEvent.time}`}
                                              size="small"
                                              variant="outlined"
                                              color={getSolarEventColor(solarEvent.type)}
                                              sx={{
                                                fontSize: '0.75rem',
                                                height: '24px',
                                                '& .MuiChip-icon': { fontSize: 14 }
                                              }}
                                            />
                                          </Tooltip>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                )}
                              </Paper>

                              {/* Hourly Timeline */}
                              <Box sx={{ mb: 3 }}>
                                <HourlyTimeline periods={periods} />
                              </Box>

                              {/* Forecast Charts */}
                              <Box sx={{ mb: 3 }}>
                                <ForecastCharts periods={periods} solarInfo={daySummary.solarInfo} />
                              </Box>

                              {/* Period Details */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  Forecast Periods ({daySummary.periodCount})
                                </Typography>
                                <IconButton
                                  onClick={() => handleTogglePeriods(coordIndex, date)}
                                  size="small"
                                  sx={{
                                    transform: expandedPeriods[`${coordIndex}_${date}`] ? 'rotate(0deg)' : 'rotate(180deg)',
                                    transition: 'transform 0.3s',
                                  }}
                                >
                                  {expandedPeriods[`${coordIndex}_${date}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Box>
                              <Collapse in={expandedPeriods[`${coordIndex}_${date}`]} timeout="auto">
                                <Grid container spacing={2}>
                                {periods.map((period, idx) => (
                                  <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Paper
                                      sx={{
                                        p: { xs: 1.5, sm: 2 },
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: 'background.paper',
                                        height: '100%',
                                        ...(isCurrentPeriod(period.start_time, period.end_time) && {
                                          border: '2px solid',
                                          borderColor: 'primary.main',
                                          boxShadow: '0 0 8px rgba(25, 118, 210, 0.3)',
                                          position: 'relative'
                                        })
                                      }}
                                    >
                                      <Stack spacing={1.5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {formatTime(period.start_time)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                                          <Stack spacing={0.5} sx={{ flex: 1 }}>
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
                                          </Stack>
                                          {period.icon && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                              <img
                                                src={period.icon}
                                                alt={period.short_forecast || "weather icon"}
                                                style={{
                                                  width: '48px',
                                                  height: '48px',
                                                  borderRadius: '8px',
                                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                }}
                                              />
                                              {period.short_forecast && (
                                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.65rem' }}>
                                                  {period.short_forecast}
                                                </Typography>
                                              )}
                                            </Box>
                                          )}
                                        </Box>
                                        {period.detailed_forecast && (
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {period.detailed_forecast}
                                          </Typography>
                                        )}
                                      </Stack>
                                    </Paper>
                                  </Grid>
                                ))}
                                </Grid>
                              </Collapse>
                            </TabPanel>
                          );
                        })}
                    </TabContext>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>
          ))}
        </TabContext>
      </Stack>
    </Box>
  );
}