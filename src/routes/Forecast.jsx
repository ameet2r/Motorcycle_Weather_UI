import { useState } from "react";
import {
  Typography,
  Button,
  Stack,
  CircularProgress,
  Box,
} from "@mui/material";
import WeatherCard from "../components/WeatherCard";

export default function Forecast() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchForecast() {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/CoordinatesToWeather/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            {
              latLng: {
                latitude: "37.4258",
                longitude: "-122.09865"
              }
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Map API response to props WeatherCard expects
      const mappedForecast = result.map(day => ({
        location: day.city ?? "Unknown location",
        temp: day.temperature_celsius ?? "N/A",
        condition: day.condition ?? "N/A",
      }));

      setForecast(mappedForecast);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setForecast([
        { location: "Error", temp: "N/A", condition: err.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Forecast
      </Typography>
      <Button
        variant="contained"
        onClick={fetchForecast}
        size="large"
      >
        Fetch Forecast
      </Button>

      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      <Stack spacing={2}>
        {forecast.map((day, idx) => (
          <WeatherCard key={idx} {...day} />
        ))}
      </Stack>
    </Stack>
  );
}
