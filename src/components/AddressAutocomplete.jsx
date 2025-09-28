import { useRef } from 'react';
import { TextField, Box } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';

export default function AddressAutocomplete({ onSelect }) {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place) {
      onSelect(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Autocomplete
        onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete;
        }}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          placeholder="Enter address..."
          label="Address"
          fullWidth
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
      </Autocomplete>
    </Box>
  );
}