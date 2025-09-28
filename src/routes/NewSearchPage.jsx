import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { keyframes } from "@emotion/react";
import {
  Typography,
  Stack,
  CircularProgress,
  Box,
  Paper,
  LinearProgress,
  Alert,
  Fade,
  Backdrop,
} from "@mui/material";
import { LoadScript } from "@react-google-maps/api";
import LocationForm from "../components/LocationForm";
import { saveSearchToHistory, generateSearchId } from "../utils/localStorage";
import { generateCoordinateSummary } from "../utils/forecastSummary";
import { authenticatedPost, isAuthError } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export default function NewSearchPage() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { membershipTier } = useUser();

  const initialCoordinates = location.state?.coordinates || [];

  async function fetchWeather(locations) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      setLoadingStep('Validating coordinates...');
      setLoadingStep('Fetching weather data...');
      
      // Use authenticated API call
      const result = await authenticatedPost('/CoordinatesToWeather/', locations);
      const map = result.coordinates_to_forecasts_map;

      setLoadingStep('Processing forecast data...');

      // Create address mapping from input locations
      const addressMap = {};
      locations.coordinates.forEach(coord => {
        const key = `${coord.latLng.latitude}:${coord.latLng.longitude}`;
        addressMap[key] = coord.address || "";
      });

      // Transform the data for storage
      const coordinatesData = Object.entries(map).map(([key, forecastsForKey]) => {
        // Each coordinate can have multiple forecasts, but we'll take the first one
        const forecast = forecastsForKey[0];

        return {
          key,
          latitude: key.split(':')[0],
          longitude: key.split(':')[1],
          address: addressMap[key] || "",
          elevation: forecast.elevation ? forecast.elevation : "",
          periods: forecast.periods,
          summary: generateCoordinateSummary(forecast)
        };
      });

      setLoadingStep('Saving search results...');

      // Create search object for localStorage
      const searchData = {
        id: generateSearchId(),
        timestamp: new Date().toISOString(),
        coordinates: coordinatesData
      };

      // Save to localStorage
      const saved = saveSearchToHistory(searchData, membershipTier);
      
      if (saved) {
        setLoadingStep('Complete!');
        setSuccess(true);
        navigate('/previous-searches');
      } else {
        throw new Error('Failed to save search results');
      }

    } catch (err) {
      console.error("Error fetching weather:", err);
      
      // Handle authentication errors
      if (isAuthError(err)) {
        setError('Your session has expired. Please log in again.');
        // Logout and redirect to auth page
        setTimeout(async () => {
          try {
            await logout();
            navigate('/auth');
          } catch (logoutError) {
            console.error('Logout error:', logoutError);
          }
        }, 2000);
      } else {
        setError(err.message || 'An unexpected error occurred while fetching weather data');
      }
    } finally {
      if (!success) {
        setLoading(false);
        setLoadingStep('');
      }
    }
  }

  return (
    <Box className="fade-in">
      <Stack spacing={4}>
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Weather Forecast Search
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Get detailed weather forecasts for your motorcycle routes across US territories
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={true}>
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              onClose={() => setError(null)}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Success Alert */}
        {success && (
          <Fade in={true}>
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Success!</strong> Weather data retrieved successfully. Redirecting to results...
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Location Form */}
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
          libraries={['places']}
        >
          <LocationForm onSubmit={fetchWeather} initialLocations={initialCoordinates} />
        </LoadScript>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          open={loading}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              minWidth: 300,
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <CloudIcon
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  animation: `${pulse} 2s infinite`
                }}
              />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Processing Weather Request
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {loadingStep}
            </Typography>
            
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 6,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress size={24} thickness={4} />
            </Box>
          </Paper>
        </Backdrop>
      </Stack>
    </Box>
  );
}

