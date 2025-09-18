import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function LocationForm({ onSubmit }) {
  const [locations, setLocations] = useState([
    { latitude: "", longitude: ""},
  ]);
  const [errors, setErrors] = useState([]);

  // handle input change for a specific location
  const handleChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);

    // Validate location and longitude values
    const newErrors = newLocations.map(validateLocation);
    setErrors(newErrors);
  };

  // add a new empty location
  const addLocation = () => {
    setLocations([...locations, { latitude: "", longitude: ""}]);
    setErrors([...errors, {}]);
  };

  // remove a location (but always keep at least one)
  const removeLocation = (index) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
      setErrors(errors.filter((_, i) => i !== index));
    }
  };

  const floatRegex = /^-?\d+(\.\d+)?$/;
  const COORDINATE_TYPE = {
    LATITUDE: "Latitude",
    LONGITUDE: "Longitude",
  };

const us_region_coordinates = [
  {"lat_min": 24.396308, "lat_max": 49.384358, "lon_min": -125.0, "lon_max": -66.93457},  // CONUS
  {"lat_min": 51.214183, "lat_max": 71.365162, "lon_min": -179.148909, "lon_max": -129.9795},  // Alaska
  {"lat_min": 18.9115, "lat_max": 22.2356, "lon_min": -160.2471, "lon_max": -154.8066},  // Hawaii
  {"lat_min": 17.8833, "lat_max": 18.5152, "lon_min": -67.9451, "lon_max": -65.2152},  // Puerto Rico
  {"lat_min": 13.25, "lat_max": 13.7, "lon_min": 144.6, "lon_max": 145.0},  // Guam
  {"lat_min": 14.0, "lat_max": 20.0, "lon_min": 144.9, "lon_max": 146.1},  // Northern Mariana Islands
  {"lat_min": -14.3, "lat_max": -11.0, "lon_min": -171.0, "lon_max": -168.0},  // American Samoa
  {"lat_min": 17.6, "lat_max": 18.5, "lon_min": -65.0, "lon_max": -64.3},  // US Virgin Islands
];

const location_in_us = (latitude, longitude) => {
  return us_region_coordinates.some(region =>
    latitude >= region.lat_min &&
    latitude <= region.lat_max &&
    longitude >= region.lon_min &&
    longitude <= region.lon_max
  );
};

const validateLocation = (location) => {
  const error = {};

  if (!floatRegex.test(location.latitude)) {
    error.latitude = "Latitude must be a valid number";
  }

  if (!floatRegex.test(location.longitude)) {
    error.longitude = "Longitude must be a valid number";
  }

  // Only run region check if both are valid numbers
  if (!error.latitude && !error.longitude) {
    const lat = parseFloat(location.latitude);
    const lon = parseFloat(location.longitude);

    if (!location_in_us(lat, lon)) {
      error.latitude = "Latitude/Longitude must be within the US or its territories";
      error.longitude = "Latitude/Longitude must be within the US or its territories";
    }
  }

  return error;
};

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all locations
    const newErrors = locations.map(validateLocation);
    setErrors(newErrors);

    // Check if any errors exist
    const hasErrors = newErrors.some(
      (err) => err.latitude || err.longitude
    );

    if (hasErrors) return;

    const coordinates = locations.map((loc) => {
      let obj = {
        latLng: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      };
      return obj;
    });

    const result = { coordinates };
    if (onSubmit) {
      onSubmit(result);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Locations Form
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {locations.map((loc, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Location {index + 1}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  label="Latitude"
                  type="text"
                  value={loc.latitude}
                  onChange={(e) => handleChange(index, "latitude", e.target.value)}
                  error={!!errors[index]?.latitude}
                  helperText={errors[index]?.latitude}
                  fullWidth
                />
                <TextField
                  label="Longitude"
                  type="text"
                  value={loc.longitude}
                  onChange={(e) => handleChange(index, "longitude", e.target.value)}
                  error={!!errors[index]?.longitude}
                  helperText={errors[index]?.longitude}
                  fullWidth
                />
                <Stack direction="column" spacing={1}>
                  {locations.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removeLocation(index)}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                  {index === locations.length - 1 && (
                    <IconButton
                      color="primary"
                      onClick={addLocation}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={errors.some(error => error.latitude || error.longitude)}
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}