import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Stack,
  CircularProgress,
  Box,
} from "@mui/material";
import LocationForm from "../components/LocationForm";
import { saveSearchToHistory, generateSearchId } from "../utils/localStorage";
import { generateCoordinateSummary } from "../utils/forecastSummary";

export default function NewSearchPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchWeather(locations) {
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/CoordinatesToWeather/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(locations),
        });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const map = result.coordinates_to_forecasts_map;

      // Transform the data for storage
      const coordinatesData = Object.entries(map).map(([key, forecastsForKey]) => {
        // Each coordinate can have multiple forecasts, but we'll take the first one
        const forecast = forecastsForKey[0];
        
        return {
          key,
          latitude: key.split(':')[0],
          longitude: key.split(':')[1],
          elevation: forecast.elevation,
          periods: forecast.periods,
          summary: generateCoordinateSummary(forecast)
        };
      });

      // Create search object for localStorage
      const searchData = {
        id: generateSearchId(),
        timestamp: new Date().toISOString(),
        coordinates: coordinatesData
      };

      // Save to localStorage
      const saved = saveSearchToHistory(searchData);
      
      if (saved) {
        // Redirect to previous searches page
        navigate('/previous-searches');
      } else {
        console.error('Failed to save search to localStorage');
        // Could show an error message to user here
      }

    } catch (err) {
      console.error("Error fetching weather:", err);
      // Could show an error message to user here
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3}>
      <LocationForm onSubmit={fetchWeather}/>

      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
            Fetching weather data...
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

