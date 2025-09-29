import { useState, useRef, useEffect } from 'react';
import { Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';
import {
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useSearchHistory } from '../hooks/useSearchHistory';
import HistoryIcon from '@mui/icons-material/History';
import LocationOnIcon from '@mui/icons-material/LocationOn';

/**
 * Enhanced Address Autocomplete with search history functionality
 * Combines Google Places API with local search history
 * Implements hybrid UI pattern with clear separation of history vs Google results
 */
export default function HistoryAddressAutocomplete({
  value = "",
  onSelect,
  ...textFieldProps
}) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [googleAutocomplete, setGoogleAutocomplete] = useState(null);
  const inputRef = useRef(null);
  
  const { getFilteredHistory } = useSearchHistory('addressHistory');
  const filteredHistory = getFilteredHistory(inputValue);
  
  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Set the initial value when the component mounts or value changes
  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.value = value;
    }
  }, [value]);
  
  const onGoogleLoad = (autocompleteInstance) => {
    setGoogleAutocomplete(autocompleteInstance);
  };
  
  const onGooglePlaceChanged = () => {
    if (googleAutocomplete !== null) {
      const place = googleAutocomplete.getPlace();
      if (place && place.formatted_address && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setInputValue(place.formatted_address);
        onSelect(place.formatted_address, lat, lng);
        setOpen(false);
      }
    }
  };
  
  const handleInputChange = (event, newValue, reason) => {
    if (reason === 'input') {
      setInputValue(newValue);
    }
  };
  
  const handleOptionSelect = (event, selectedValue, reason) => {
    if (reason === 'selectOption' && selectedValue) {
      const historyEntry = filteredHistory.find(entry => entry.value === selectedValue);
      if (historyEntry && historyEntry.coordinates) {
        setInputValue(historyEntry.value);
        onSelect(
          historyEntry.value,
          historyEntry.coordinates.lat,
          historyEntry.coordinates.lng
        );
        setOpen(false);
      }
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  // Create combined options from history
  const historyOptions = filteredHistory.map(entry => ({
    type: 'history',
    value: entry.value,
    entry: entry
  }));
  
  // For the Autocomplete component, we only show history options
  // Google Places will be handled by the underlying Google Autocomplete
  const options = historyOptions.map(option => option.value);
  
  return (
    <GoogleAutocomplete
      onLoad={onGoogleLoad}
      onPlaceChanged={onGooglePlaceChanged}
    >
      <Autocomplete
        freeSolo
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        options={options}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleOptionSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            {...textFieldProps}
            inputRef={inputRef}
            label="Enter address"
            placeholder="Start typing an address..."
            fullWidth
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              },
              ...textFieldProps.sx
            }}
          />
        )}
        renderOption={(props, option) => {
          const optionData = historyOptions.find(opt => opt.value === option);
          const historyEntry = optionData?.entry;
          
          // Extract key from props to avoid React warning
          const { key, ...otherProps } = props;
          
          return (
            <Box
              component="li"
              key={key}
              {...otherProps}
              sx={{
                ...otherProps.sx,
                py: 1.5, // More vertical padding for better readability
                px: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <HistoryIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}> {/* minWidth: 0 allows text to truncate */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {option}
                  </Typography>
                  {historyEntry?.coordinates && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.25,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace' // Better for coordinates
                      }}
                    >
                      {historyEntry.coordinates.lat.toFixed(4)}, {historyEntry.coordinates.lng.toFixed(4)}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label="History"
                  size="small"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    fontSize: '0.65rem',
                    height: 18,
                    flexShrink: 0, // Prevent chip from shrinking
                    '& .MuiChip-label': {
                      px: 0.75
                    }
                  }}
                />
              </Box>
            </Box>
          );
        }}
        PaperComponent={({ children, ...props }) => (
          <Paper
            {...props}
            elevation={8}
            sx={{
              minWidth: 350, // Wider for addresses
              maxWidth: 500,
              ...props.sx
            }}
          >
            {filteredHistory.length > 0 && (
              <>
                <Box sx={{
                  px: 2,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'grey.50'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {inputValue ? 'Matching History:' : 'Recent Addresses:'}
                  </Typography>
                </Box>
                {children}
                <Divider />
                <Box sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: 'primary.50'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 14, color: 'primary.main' }} />
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                      Google Places suggestions will appear as you type
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
            {filteredHistory.length === 0 && (
              <>
                {children}
                <Box sx={{
                  px: 2,
                  py: 2,
                  textAlign: 'center',
                  backgroundColor: 'grey.50'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      Start typing to see Google Places suggestions
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        )}
        noOptionsText={
          inputValue 
            ? "No matching addresses in history" 
            : "No recent addresses"
        }
        // Styling for the dropdown
        sx={{
          '& .MuiAutocomplete-popper': {
            zIndex: 1300
          }
        }}
      />
    </GoogleAutocomplete>
  );
}