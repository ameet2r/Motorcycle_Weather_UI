import { useState } from "react";
import {
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
} from "@mui/material";
import WeatherCard from "../components/WeatherCard";
import LocationForm from "../components/LocationForm";

//TODO Update output to show errors if I get a raised exception from the backend.
export default function NewSearchPage() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Create an array of forecast objects for all keys
      const forecastArray = Object.entries(map).flatMap(([key, forecastsForKey]) => {
        return forecastsForKey.map(forecast => ({
          key,       // keep track of the lat:lng key if you want
          ...forecast
        }));
      });

      setForecasts(forecastArray);
    } catch (err) {
      console.error("Error fetching weather:", err);
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
        </Box>
      )}

      <div>
        <Typography variant="h4" gutterBottom>
          Forecasts:
        </Typography>
        <Stack spacing={2}>
          {forecasts && forecasts.length > 0 ? (forecasts.map((forecast, idx) => (
            <Card key={idx}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {forecast.key} (Elevation: {forecast.elevation} ft)
                </Typography>
                <List dense>
                  {forecast.periods && forecast.periods.length > 0 ? (forecast.periods.map((period, pIdx) => (
                    <ListItem key={pIdx}>
                      <ListItemText
                        primary={`${period.name} (${period.start_time} to ${period.end_time})`}
                        secondary={
                          <>
                            Temp: {period.temperature} °F, {period.short_forecast}<br />
                            Wind: {period.wind_direction} {period.wind_speed}<br />
                            Precip: {period.probability_of_precip ?? 0}%<br />
                            Detailed Forecast: {period.detailed_forecast ?? ""}
                          </>
                        }
                      />
                    </ListItem>
                  ))) : (
                    <Typography variant="body1">No forecast data could be found for your coordinates</Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          ))) : (
            <Typography variant="body1">No data could be found for your coordinates</Typography>
          )}
        </Stack>
      </div>
    </Stack>
  );
}

