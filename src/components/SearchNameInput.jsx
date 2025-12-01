import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { useRef, useEffect } from 'react';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchNameInput({
  value = '',
  onChange,
  onValidate,
  onClearError,
  disabled = false,
  label = "Search Name (Optional)",
  helperText = "Give this search a memorable name",
  error = false,
  errorText = ""
}) {
  const validationTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear any existing error immediately when user types
    if (onClearError && error) {
      onClearError();
    }

    // Debounce validation to avoid triggering on every keystroke
    if (onValidate) {
      // Clear previous timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Set new timeout for validation (500ms after user stops typing)
      validationTimeoutRef.current = setTimeout(() => {
        onValidate(newValue);
      }, 500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      error={error}
      helperText={error ? errorText : helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <DriveFileRenameOutlineIcon color={disabled ? 'disabled' : 'action'} />
          </InputAdornment>
        ),
        endAdornment: value && !disabled && (
          <InputAdornment position="end">
            <Tooltip title="Clear name">
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
      inputProps={{
        maxLength: 100
      }}
    />
  );
}
