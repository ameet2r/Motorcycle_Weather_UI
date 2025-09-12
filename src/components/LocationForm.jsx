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
  const validateLocation = (location) => {
    const error = {};

    if (!floatRegex.test(location.latitude)) {
      error.latitude = "Latitude must be a valid number";
    } else {
      const latitude = parseFloat(location.latitude);
      if (latitude < -90 || latitude > 90) {
        error.latitude = "Latitude must be between -90 and 90";
      }
    }

    if (!floatRegex.test(location.longitude)) {
      error.longitude = "Longitude must be a valid number";
    } else {
      const longitude = parseFloat(location.longitude);
      if (longitude < -180 || longitude > 180) {
        error.longitude = "Longitude must be between -180 and 180";
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