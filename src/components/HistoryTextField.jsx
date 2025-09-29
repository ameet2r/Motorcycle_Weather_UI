import { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { useSearchHistory } from '../hooks/useSearchHistory';
import HistoryIcon from '@mui/icons-material/History';

/**
 * Enhanced TextField with search history functionality
 * Implements hybrid UI pattern: shows recent entries on focus, filters as user types
 */
export default function HistoryTextField({
  label,
  historyKey,
  value,
  onChange,
  onHistorySelect,
  error,
  helperText,
  placeholder,
  fullWidth = true,
  ...textFieldProps
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [open, setOpen] = useState(false);
  const { getFilteredHistory } = useSearchHistory(historyKey);
  
  const filteredHistory = getFilteredHistory(inputValue);
  
  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  
  const handleInputChange = (event, newValue, reason) => {
    if (reason === 'input') {
      setInputValue(newValue);
      onChange(newValue);
    }
  };
  
  const handleOptionSelect = (event, selectedValue, reason) => {
    if (reason === 'selectOption' && selectedValue) {
      const historyEntry = filteredHistory.find(entry => entry.value === selectedValue);
      if (historyEntry && onHistorySelect) {
        onHistorySelect(historyEntry);
      } else {
        onChange(selectedValue);
      }
      setOpen(false);
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  // Convert history entries to option strings
  const options = filteredHistory.map(entry => entry.value);
  
  return (
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
          label={label}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          fullWidth={fullWidth}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }
            },
            '& .MuiOutlinedInput-input': {
              // Better handling of long coordinate values
              fontFamily: 'monospace', // Monospace font for better coordinate display
              fontSize: '0.875rem'
            },
            ...textFieldProps.sx
          }}
        />
      )}
      renderOption={(props, option) => {
        const historyEntry = filteredHistory.find(entry => entry.value === option);
        
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
                    wordBreak: 'break-all' // Allow breaking of long numbers
                  }}
                >
                  {option}
                </Typography>
                {historyEntry?.context && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.25,
                      fontSize: '0.75rem'
                    }}
                  >
                    {historyEntry.context}
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
            minWidth: 300, // Ensure minimum width for readability
            maxWidth: 400, // Prevent it from getting too wide
            ...props.sx
          }}
        >
          {filteredHistory.length > 0 && (
            <Box sx={{
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {inputValue ? 'Matching History:' : 'Recent:'}
              </Typography>
            </Box>
          )}
          {children}
        </Paper>
      )}
      noOptionsText={
        inputValue 
          ? "No matching history entries" 
          : "No recent entries"
      }
      // Styling for the dropdown
      sx={{
        '& .MuiAutocomplete-popper': {
          zIndex: 1300
        }
      }}
    />
  );
}