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
import LocationForm from "../components/LocationForm";
import SearchNameInput from "../components/SearchNameInput";
import { generateSearchId } from "../utils/localStorage";
import { saveSearch, getSearchByIdFromStorage, getAllSearches } from "../utils/searchStorage";
import { searchSearchesBackend } from "../utils/searchStorage";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { membershipTier } = useUser();

  const initialCoordinates = location.state?.coordinates || [];
  const originalSearchId = location.state?.originalSearchId || null;
  const initialSearchName = location.state?.searchName || '';

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchName, setSearchName] = useState(initialSearchName);
  const [nameError, setNameError] = useState('');
  const [validatingName, setValidatingName] = useState(false);

  const validateSearchName = async (name, isSubmitValidation = false) => {
    if (!name || name.trim() === '') {
      setNameError('');
      return true;
    }

    // Only show validating state during form submission, not during typing
    if (isSubmitValidation) {
      setValidatingName(true);
    }

    try {
      // Check local searches first (fast)
      const localSearches = getAllSearches(membershipTier);
      const duplicate = localSearches.find(s =>
        s.id !== originalSearchId && // Exclude the search being edited
        s.name && s.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (duplicate) {
        setNameError('A search with this name already exists');
        if (isSubmitValidation) setValidatingName(false);
        return false;
      }

      // For premium users, check backend as well
      if (membershipTier === 'plus' || membershipTier === 'pro') {
        const backendResult = await searchSearchesBackend(membershipTier, name);
        const exactMatch = backendResult.searches.find(s =>
          s.id !== originalSearchId && // Exclude the search being edited
          s.name && s.name.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (exactMatch) {
          setNameError('A search with this name already exists');
          if (isSubmitValidation) setValidatingName(false);
          return false;
        }
      }

      setNameError('');
      if (isSubmitValidation) setValidatingName(false);
      return true;
    } catch (error) {
      console.error('Error validating name:', error);
      if (isSubmitValidation) setValidatingName(false);
      return true;  // Allow on error
    }
  };

  async function fetchWeather(locations) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate name before proceeding
      if (searchName && searchName.trim()) {
        const isValid = await validateSearchName(searchName, true);
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

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
          elevation: forecast.elevation ? String(forecast.elevation) : "",
          periods: forecast.periods,
          summary: generateCoordinateSummary(forecast, key.split(':')[0], key.split(':')[1])
        };
      });

      setLoadingStep('Saving search results...');

      // Create search object for localStorage
      const searchData = {
        id: generateSearchId(),
        timestamp: new Date().toISOString(),
        name: searchName.trim() || undefined,
        coordinates: coordinatesData
      };

      // Save to appropriate storage and delete duplicates/original (localStorage for free, backend for plus/pro)
      await saveSearch(searchData, membershipTier, originalSearchId);

      // Verify search was saved to localStorage before navigating
      const savedSearch = getSearchByIdFromStorage(searchData.id, membershipTier);
      if (!savedSearch) {
        throw new Error('Search was not properly saved to storage');
      }

      setLoadingStep('Complete!');
      setSuccess(true);
      navigate(`/forecast/${searchData.id}`);

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

        {/* Search Name Input (Plus/Pro only) */}
        {(membershipTier === 'plus' || membershipTier === 'pro') && (
          <Fade in={true}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <SearchNameInput
                value={searchName}
                onChange={setSearchName}
                onValidate={validateSearchName}
                onClearError={() => setNameError('')}
                disabled={loading || validatingName}
                error={!!nameError}
                errorText={nameError}
              />
            </Paper>
          </Fade>
        )}

        {/* Location Form */}
        <LocationForm onSubmit={fetchWeather} initialLocations={initialCoordinates} />

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

