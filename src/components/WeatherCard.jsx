import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  Stack,
  Chip,
} from "@mui/material";

export default function WeatherCard(location, forecast) {
  if (!location && !forecast) return <Typography>Loading...</Typography>;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {location}
        </Typography>
        <ForecastCard {...forecast} />
      </CardContent>
    </Card>
  );
}

function ForecastCard(forecast) {
  const [expanded, setExpanded] = useState(false);

  if (!forecast) return <Typography>Loading forecast...</Typography>;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Elevation: {forecast.elevation ?? "N/A"} ft
        </Typography>

        <Button
          variant="contained"
          onClick={() => setExpanded(!expanded)}
          sx={{ mb: 2 }}
        >
          {expanded ? "Hide Periods" : `Show ${forecast.periods.length} Periods`}
        </Button>

        <Collapse in={expanded}>
          <Stack spacing={2}>
            {forecast.periods.map((period, idx) => (
              <PeriodCard key={idx} {...period} />
            ))}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}

function PeriodCard(period) {
  if (!period) return <Typography>Loading...</Typography>;
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {period.name ?? "No Name"}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Time:</strong> {period.start_time ?? "No start time"} to {period.end_time ?? "No end time"}
          </Typography>
          <Typography variant="body2">
            <strong>Icon:</strong> {period.icon ?? "No icon"}
          </Typography>
          <Typography variant="body2">
            <strong>Day Time:</strong> {period.is_day_time ? "Yes" : "No"}
          </Typography>
          <Typography variant="body2">
            <strong>Precipitation:</strong> {period.probability_of_precip ?? 0}%
          </Typography>
          <Typography variant="body2">
            <strong>Forecast:</strong> {period.short_forecast ?? "No short forecast"}
          </Typography>
          <Typography variant="body2">
            <strong>Detailed:</strong> {period.detailed_forecast ?? "No detailed forecast"}
          </Typography>
          <Typography variant="body2">
            <strong>Temperature:</strong> {period.temperature ?? 0}°F
          </Typography>
          <Typography variant="body2">
            <strong>Wind:</strong> {period.wind_direction ?? "No wind"} {period.wind_speed ?? "No speed"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}



