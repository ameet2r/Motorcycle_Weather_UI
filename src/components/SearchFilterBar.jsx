import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  Fade,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloudSearchIcon from '@mui/icons-material/CloudQueue';

/**
 * SearchFilterBar component for filtering search history
 * Only shown to plus/pro users
 * @param {Object} props - Component props
 * @param {Function} props.onSearchLocal - Callback when local search is triggered
 * @param {Function} props.onSearchBackend - Callback when backend search is triggered
 * @param {Function} props.onClear - Callback when search is cleared
 * @param {boolean} props.isSearching - Whether a search is in progress
 * @param {number} props.resultCount - Number of results found (optional)
 * @param {string} props.source - Source of results ('localStorage' or 'backend')
 * @param {boolean} props.showBackendSearch - Whether to show "Search Cloud" button
 */
const SearchFilterBar = ({
  onSearchLocal,
  onSearchBackend,
  onClear,
  isSearching = false,
  resultCount = null,
  source = null,
  showBackendSearch = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isFirstRender = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchText]);

  // Trigger local search when debounced value changes
  useEffect(() => {
    // Skip the initial render to avoid unnecessary reload
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Call onSearchLocal with the debounced value
    // This includes when it becomes empty (to clear the filter)
    onSearchLocal(debouncedSearch.trim());
  }, [debouncedSearch, onSearchLocal]);

  const handleClear = () => {
    setSearchText('');
    setDebouncedSearch('');
    onClear();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      setDebouncedSearch(searchText.trim());
      onSearchLocal(searchText.trim());
    }
  };

  const handleBackendSearch = () => {
    if (searchText.trim()) {
      onSearchBackend(searchText.trim());
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(66, 165, 245, 0.03) 100%)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by location or address..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={isSearching ? 'disabled' : 'action'} />
              </InputAdornment>
            ),
            endAdornment: (searchText || debouncedSearch) && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  disabled={isSearching}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '2px',
              }
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              height: 48
            }
          }}
        />

        {/* Search result info and backend search button */}
        {debouncedSearch && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {/* Result chips */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {resultCount !== null && (
                  <Chip
                    label={`${resultCount} result${resultCount !== 1 ? 's' : ''} found`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {source && (
                  <Chip
                    label={source === 'localStorage' ? 'From local cache' : 'From cloud storage'}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: source === 'localStorage' ? 'info.main' : 'success.main',
                      color: source === 'localStorage' ? 'info.main' : 'success.main'
                    }}
                  />
                )}
              </Box>

              {/* Search cloud button */}
              {showBackendSearch && resultCount === 0 && source === 'localStorage' && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CloudSearchIcon />}
                  onClick={handleBackendSearch}
                  disabled={isSearching}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                    }
                  }}
                >
                  Search Cloud Storage
                </Button>
              )}
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
};

export default SearchFilterBar;
