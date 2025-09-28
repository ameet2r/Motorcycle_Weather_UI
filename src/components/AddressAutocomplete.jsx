import { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { TextField } from '@mui/material';

export default function AddressAutocomplete({ onSelect, value = "" }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onSelect(place.formatted_address, lat, lng);
      }
    }
  };

  // Set the initial value when the component mounts or value changes
  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
    >
      <TextField
        inputRef={inputRef}
        label="Enter address"
        variant="outlined"
        fullWidth
        defaultValue={value}
        placeholder="Start typing an address..."
        sx={{
          mt: 2,
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }
          }
        }}
      />
    </Autocomplete>
  );
}