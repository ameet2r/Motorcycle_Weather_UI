import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Paper,
  Fade,
  Tooltip,
  Alert,
  Divider,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import AddressAutocomplete from './AddressAutocomplete';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CircularProgress from "@mui/material/CircularProgress";

export default function LocationForm({ onSubmit, initialLocations = [] }) {
  const [locations, setLocations] = useState(
    initialLocations.length > 0
      ? initialLocations.map(coord => {
          const hasAddress = coord.address && coord.address.trim() !== "";
          return {
            latitude: coord.latitude.toString(),
            longitude: coord.longitude.toString(),
            address: coord.address || "",
            inputType: hasAddress ? "address" : "coordinates"
          };
        })
      : [{ latitude: "", longitude: "", address: "", inputType: "coordinates" }]
  );
  const [errors, setErrors] = useState([]);
  const [geolocationLoading, setGeolocationLoading] = useState({});
  const [geolocationError, setGeolocationError] = useState({});

  useEffect(() => {
    if (initialLocations.length > 0) {
      const formattedLocations = initialLocations.map(coord => {
        // Determine input type based on whether address exists
        const hasAddress = coord.address && coord.address.trim() !== "";
        const inputType = hasAddress ? "address" : "coordinates";
        
        return {
          latitude: coord.latitude.toString(),
          longitude: coord.longitude.toString(),
          address: coord.address || "",
          inputType: inputType
        };
      });
      
      setLocations(formattedLocations);

      // We know this search passed validation before, so no need to rerun validation
      setErrors(new Array(formattedLocations.length).fill({}));
    }
  }, [initialLocations]);

  // handle input change for a specific location
  const handleChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);

    // Validate location and longitude values only if field is latitude or longitude and inputType is coordinates
    if ((field === 'latitude' || field === 'longitude') && newLocations[index].inputType === 'coordinates') {
      const newErrors = newLocations.map(validateLocation);
      setErrors(newErrors);
    }
  };

  // add a new empty location
  const addLocation = () => {
    setLocations([...locations, { latitude: "", longitude: "", address: "", inputType: "coordinates"}]);
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

  const handleGetCurrentLocation = (index) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setGeolocationError({
        ...geolocationError,
        [index]: "Geolocation is not supported by your browser"
      });
      return;
    }

    // Clear any previous error
    setGeolocationError({
      ...geolocationError,
      [index]: null
    });

    // Set loading state
    setGeolocationLoading({
      ...geolocationLoading,
      [index]: true
    });

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Update location with current coordinates
        const newLocations = [...locations];
        newLocations[index].latitude = latitude.toString();
        newLocations[index].longitude = longitude.toString();
        setLocations(newLocations);

        // Validate the new coordinates
        const newErrors = newLocations.map(validateLocation);
        setErrors(newErrors);

        // Clear loading state
        setGeolocationLoading({
          ...geolocationLoading,
          [index]: false
        });
      },
      (error) => {
        // Handle errors
        let errorMessage = "Unable to retrieve your location";

        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while retrieving location.";
        }

        setGeolocationError({
          ...geolocationError,
          [index]: errorMessage
        });

        setGeolocationLoading({
          ...geolocationLoading,
          [index]: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all locations
    const newErrors = locations.map((loc, index) => {
      if (loc.inputType === 'coordinates') {
        return validateLocation(loc);
      } else {
        // For address, check if lat/lng are populated
        if (!loc.latitude || !loc.longitude) {
          return { latitude: "Please select an address", longitude: "Please select an address" };
        }
        return {};
      }
    });
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
      if (loc.address) {
        obj.address = loc.address;
      }
      return obj;
    });

    const result = { coordinates };
    if (onSubmit) {
      onSubmit(result);
    }
  };

  return (
    <Box className="fade-in">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, sm: 2 },
          mb: 4,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(66, 165, 245, 0.02) 100%)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LocationOnIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Weather Locations
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Enter coordinates for locations within the US and its territories to get detailed weather forecasts
          </Typography>
          
          {/* Info Alert */}
          <Alert
            severity="info"
            icon={<InfoIcon />}
            sx={{
              mt: 3,
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.875rem' }
            }}
          >
            <Typography variant="body2">
              <strong>Supported regions:</strong> Continental US, Alaska, Hawaii, Puerto Rico, US Virgin Islands, Guam, Northern Mariana Islands, and American Samoa
            </Typography>
          </Alert>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Location Cards */}
            {locations.map((loc, index) => (
              <Fade in={true} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                    }
                  }}
                >
                  {/* Location Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={`Location ${index + 1}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      {locations.length > 1 && (
                        <Tooltip title="Remove Location">
                          <IconButton
                            color="error"
                            onClick={() => removeLocation(index)}
                            size="small"
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'error.contrastText',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {index === locations.length - 1 && (
                        <Tooltip title="Add Another Location">
                          <IconButton
                            color="primary"
                            onClick={addLocation}
                            size="small"
                            sx={{
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  {/* Input Type Selection */}
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Input Method</FormLabel>
                    <RadioGroup
                      row
                      value={loc.inputType}
                      onChange={(e) => handleChange(index, "inputType", e.target.value)}
                    >
                      <FormControlLabel value="coordinates" control={<Radio />} label="Coordinates" />
                      <FormControlLabel value="address" control={<Radio />} label="Address" />
                    </RadioGroup>
                  </FormControl>

                  {/* Conditional Inputs */}
                  {loc.inputType === 'coordinates' && (
                    <>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <TextField
                          label="Latitude"
                          type="text"
                          value={loc.latitude}
                          onChange={(e) => handleChange(index, "latitude", e.target.value)}
                          error={!!errors[index]?.latitude}
                          helperText={errors[index]?.latitude || "e.g., 40.7128"}
                          fullWidth
                          placeholder="Enter latitude"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main'
                                }
                              }
                            }
                          }}
                        />
                        <TextField
                          label="Longitude"
                          type="text"
                          value={loc.longitude}
                          onChange={(e) => handleChange(index, "longitude", e.target.value)}
                          error={!!errors[index]?.longitude}
                          helperText={errors[index]?.longitude || "e.g., -74.0060"}
                          fullWidth
                          placeholder="Enter longitude"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'primary.main'
                                }
                              }
                            }
                          }}
                        />
                      </Stack>

                      {/* Use Current Location Button */}
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Button
                          variant="outlined"
                          size="medium"
                          startIcon={geolocationLoading[index] ? <CircularProgress size={20} /> : <MyLocationIcon />}
                          onClick={() => handleGetCurrentLocation(index)}
                          disabled={geolocationLoading[index]}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          {geolocationLoading[index] ? 'Getting Location...' : 'Use My Current Location'}
                        </Button>

                        {/* Geolocation Error Alert */}
                        {geolocationError[index] && (
                          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {geolocationError[index]}
                          </Alert>
                        )}
                      </Box>
                    </>
                  )}

                  {loc.inputType === 'address' && (
                    <AddressAutocomplete
                      value={loc.address}
                      onSelect={(address, lat, lng) => {
                        handleChange(index, "address", address);
                        handleChange(index, "latitude", lat.toString());
                        handleChange(index, "longitude", lng.toString());
                      }}
                    />
                  )}
                </Paper>
              </Fade>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                disabled={locations.some((loc, index) => {
                  if (loc.inputType === 'coordinates') {
                    return errors[index]?.latitude || errors[index]?.longitude;
                  } else {
                    return !loc.latitude || !loc.longitude;
                  }
                })}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'action.disabled'
                  }
                }}
              >
                Get Weather Forecast
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}