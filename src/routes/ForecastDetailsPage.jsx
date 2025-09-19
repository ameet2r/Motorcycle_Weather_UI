import { useState, useEffect } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Loading forecast details...</Typography>
      </Box>
    );
  }

  if (error || !search) {
    return (
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to Previous Searches
        </Button>
        <Alert severity="error">
          {error || 'Search not found'}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to Previous Searches
      </Button>

      {/* Header */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Forecast Details
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Search from {formatDateTime(search.timestamp)}
        </Typography>
      </Box>

      {/* Forecast data for each coordinate */}
      <Stack spacing={3}>
        {search.coordinates.map((coord, coordIndex) => (
          <Card key={coordIndex} sx={{ mb: 2 }}>
            <CardContent>
              {/* Coordinate header */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {coord.latitude}, {coord.longitude}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Elevation: {coord.elevation} ft
                </Typography>
                
                {/* Daily Summary Overview */}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Daily Summaries ({coord.summary.dayCount} days, {coord.summary.totalPeriods} periods)
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(coord.summary.dailySummaries)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, daySummary]) => (
                      <Box key={date} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {formatDateWithRelativeDay(date)} ({daySummary.periodCount} periods)
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            label={`Temp: ${formatTemperatureRange(daySummary.tempRange)}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`Wind: ${formatWindRange(daySummary.windRange)}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={`Precip: ${formatPrecipitationRange(daySummary.precipRange)}`}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </Box>

              {/* Detailed periods */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Detailed Forecast Periods
              </Typography>
              
              {coord.periods && coord.periods.length > 0 ? (
                <List dense>
                  {coord.periods.map((period, periodIndex) => (
                    <ListItem key={periodIndex} sx={{ mb: 1 }}>
                      <Paper sx={{ width: '100%', p: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" component="div">
                              {period.name || `Period ${periodIndex + 1}`}
                            </Typography>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              <Typography variant="body2" component="span">
                                <strong>Time:</strong> {formatPeriodTime(period.start_time, period.end_time)}
                              </Typography>
                              <Typography variant="body2" component="span">
                                <strong>Temperature:</strong> {period.temperature}°F
                              </Typography>
                              <Typography variant="body2" component="span">
                                <strong>Wind:</strong> {period.wind_direction} {period.wind_speed}
                              </Typography>
                              <Typography variant="body2" component="span">
                                <strong>Precipitation Chance:</strong> {period.probability_of_precip ?? 0}%
                                </Typography>
                              <Typography variant="body2" component="span">
                                <strong>Conditions:</strong> {period.short_forecast}
                              </Typography>
                              {period.detailed_forecast && (
                                <Typography variant="body2" component="span">
                                  <strong>Details:</strong> {period.detailed_forecast}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                      </Paper>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No detailed forecast periods available for this coordinate.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}