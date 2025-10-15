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

  useEffect(() => {
    loadSearchDetails();
  }, [searchId]);

  const loadSearchDetails = () => {
    setLoading(true);
    setError(null);

    try {
      const searchData = getSearchByIdFromStorage(searchId, membershipTier);
      if (!searchData) {
        setError('Search not found. It may have been deleted or expired.');
      } else {
        setSearch(searchData);
        // Initialize the first day for each location
        const initialDayTabs = {};
        searchData.coordinates.forEach((coord, index) => {
          const dates = Object.keys(coord.summary.dailySummaries).sort();
          if (dates.length > 0) {
            initialDayTabs[index] = dates[0];
          }
        });
        setActiveDayTabs(initialDayTabs);
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

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDayTabChange = (locationIndex, newDayValue) => {
    setActiveDayTabs(prev => ({
      ...prev,
      [locationIndex]: newDayValue
    }));
  };

  const handleTogglePeriods = (coordIndex, date) => {
    const key = `${coordIndex}_${date}`;
    setExpandedPeriods(prev => ({
      ...prev,
      [key]: !prev[key]
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