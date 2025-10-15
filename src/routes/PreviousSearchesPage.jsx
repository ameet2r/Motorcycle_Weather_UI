import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Stack,
  Button,
  Box,
  Paper,
  Alert,
  Fade,
  Skeleton,
  Chip,
  Divider,
  Backdrop,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateSearchId } from "../utils/localStorage";
import {
  getAllSearches,
  clearAllSearches,
  deleteSearch,
  saveSearch,
  syncSearchesFromBackend,
  getSearchByIdFromStorage,
  searchSearchesLocal,
  searchSearchesBackend
} from "../utils/searchStorage";
import { generateCoordinateSummary } from "../utils/forecastSummary";
import { formatDateTime } from "../utils/dateTimeFormatters";
import { authenticatedPost, isAuthError } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import SearchSummaryCard from "../components/SearchSummaryCard";
import SearchFilterBar from "../components/SearchFilterBar";

const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export default function PreviousSearchesPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [redoLoading, setRedoLoading] = useState(false);
  const [redoLoadingStep, setRedoLoadingStep] = useState('');
  const [redoError, setRedoError] = useState(null);
  const [redoSuccess, setRedoSuccess] = useState(false);
  const [redoingSearchId, setRedoingSearchId] = useState(null);
  const [deletingSearchId, setDeletingSearchId] = useState(null);

  // Pagination state (for plus/pro users)
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalSearches, setTotalSearches] = useState(0);

  // Search/filter state (for plus/pro users)
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { membershipTier } = useUser();

  // Check if user is premium (plus or pro)
  const isPremium = membershipTier === 'plus' || membershipTier === 'pro';

  // Adaptive initial limit based on screen size (for premium users)
  const getInitialLimit = () => {
    if (!isPremium) return 3; // Free users always have max 3
    const isMobile = window.innerWidth < 768;
    return isMobile ? 15 : 30;
  };

  const [limit] = useState(getInitialLimit());

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    setLoading(true);
    setSearchText('');
    setSearchSource(null);
    try {
      // Sync from backend for plus/pro users, use localStorage for free users
      const result = await syncSearchesFromBackend(membershipTier, limit, 0, false);
      setSearches(result.searches);
      setTotalSearches(result.total);
      setHasMore(result.hasMore);
      setOffset(limit);
    } catch (error) {
      console.error('Error loading search history:', error);
      // Fallback to local cache if sync fails
      const localHistory = getAllSearches(membershipTier);
      setSearches(localHistory);
      setTotalSearches(localHistory.length);
      setHasMore(false);
      setOffset(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!isPremium || !hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const result = await syncSearchesFromBackend(membershipTier, limit, offset, true);
      setSearches(result.searches);
      setTotalSearches(result.total);
      setHasMore(result.hasMore);
      setOffset(offset + limit);
    } catch (error) {
      console.error('Error loading more searches:', error);
      setRedoError('Failed to load more searches. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClearSearch = useCallback(async () => {
    setSearchText('');
    setSearchSource(null);
    await loadSearchHistory();
  }, [membershipTier, limit]);

  const handleSearchLocal = useCallback((searchQuery) => {
    // If empty query, reset to show all searches
    if (!searchQuery || !searchQuery.trim()) {
      handleClearSearch();
      return;
    }

    setSearchText(searchQuery);
    const result = searchSearchesLocal(membershipTier, searchQuery);
    setSearches(result.searches);
    setTotalSearches(result.total);
    setHasMore(false); // Disable load more when searching
    setSearchSource(result.source);
  }, [membershipTier, handleClearSearch]);

  const handleSearchBackend = useCallback(async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return;

    setIsSearching(true);
    setSearchText(searchQuery);
    try {
      const result = await searchSearchesBackend(membershipTier, searchQuery);
      if (result.error) {
        setRedoError(result.error);
        // Clear searches on error
        setSearches([]);
        setTotalSearches(0);
        setHasMore(false);
        setSearchSource('error');
        return;
      }
      setSearches(result.searches);
      setTotalSearches(result.total);
      setHasMore(false); // Disable load more when searching
      setSearchSource(result.source);
    } catch (error) {
      console.error('Error searching backend:', error);
      setRedoError('Failed to search cloud storage. Please try again.');
      // Clear searches on error
      setSearches([]);
      setTotalSearches(0);
      setHasMore(false);
      setSearchSource('error');
    } finally {
      setIsSearching(false);
    }
  }, [membershipTier]);

  const handleSearchClick = (searchId) => {
    navigate(`/forecast/${searchId}`);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      try {
        await clearAllSearches(membershipTier);
        setSearches([]);
      } catch (error) {
        console.error('Failed to clear search history:', error);
        // Show error to user
        setRedoError('Failed to clear search history. Please try again.');
      }
    }
  };

  const handleDeleteSearch = async (search) => {
    if (window.confirm(`Are you sure you want to delete this search from ${formatDateTime(search.timestamp)}?`)) {
      setDeletingSearchId(search.id);
      try {
        await deleteSearch(search.id, membershipTier);
        // Remove from local state
        setSearches(prevSearches => prevSearches.filter(s => s.id !== search.id));
      } catch (error) {
        console.error('Failed to delete search:', error);
        // Show error to user
        setRedoError('Failed to delete search. Please try again.');
      } finally {
        setDeletingSearchId(null);
      }
    }
  };

  const handleNewSearch = () => {
    navigate('/');
  };

  const handleEditSearch = (search) => {
    navigate('/', { state: { coordinates: search.coordinates, originalSearchId: search.id } });
  };

  const handleRedoSearch = async (search) => {
    setRedoLoading(true);
    setRedoError(null);
    setRedoSuccess(false);
    setRedoingSearchId(search.id);

    try {
      setRedoLoadingStep('Preparing search data...');
      
      // Transform search coordinates back to API format
      const apiCoordinates = {
        coordinates: search.coordinates.map(coord => ({
          latLng: {
            latitude: coord.latitude,
            longitude: coord.longitude
          },
          address: coord.address || ""
        }))
      };

      setRedoLoadingStep('Fetching weather data...');
      
      // Use authenticated API call
      const result = await authenticatedPost('/CoordinatesToWeather/', apiCoordinates);
      const map = result.coordinates_to_forecasts_map;

      setRedoLoadingStep('Processing forecast data...');

      // Create address mapping from search coordinates
      const addressMap = {};
      search.coordinates.forEach(coord => {
        const key = `${coord.latitude}:${coord.longitude}`;
        addressMap[key] = coord.address || "";
      });

      // Transform the data for storage
      const coordinatesData = Object.entries(map).map(([key, forecastsForKey]) => {
        // Each coordinate can have multiple forecasts, but we'll take the first one
        const forecast = forecastsForKey[0];

        return {
          key,
          latitude: key.split(':')[0],
          longitude: key.split(':')[1],
          address: addressMap[key] || "",
          elevation: forecast.elevation ? String(forecast.elevation) : "",
          periods: forecast.periods,
          summary: generateCoordinateSummary(forecast, key.split(':')[0], key.split(':')[1])
        };
      });

      setRedoLoadingStep('Saving search results...');

      // Create search object for localStorage
      const searchData = {
        id: generateSearchId(),
        timestamp: new Date().toISOString(),
        coordinates: coordinatesData
      };

      // Save to appropriate storage and delete the original search (localStorage for free, backend for plus/pro)
      await saveSearch(searchData, membershipTier, search.id);

      // Verify search was saved to localStorage before navigating
      const savedSearch = getSearchByIdFromStorage(searchData.id, membershipTier);
      if (!savedSearch) {
        throw new Error('Search was not properly saved to storage');
      }

      setRedoLoadingStep('Complete!');
      setRedoSuccess(true);

      // Reload search history to show the new search
      await loadSearchHistory();

      // Navigate to the new search details
      navigate(`/forecast/${searchData.id}`);

    } catch (err) {
      console.error("Error redoing search:", err);
      
      // Handle authentication errors
      if (isAuthError(err)) {
        setRedoError('Your session has expired. Please log in again.');
        // Logout and redirect to auth page
        setTimeout(async () => {
          try {
            await logout();
            navigate('/auth');
          } catch (logoutError) {
            console.error('Logout error:', logoutError);
          }
        }, 2000);
      } else {
        setRedoError(err.message || 'An unexpected error occurred while fetching weather data');
      }
    } finally {
      if (!redoSuccess) {
        setRedoLoading(false);
        setRedoLoadingStep('');
        setRedoingSearchId(null);
      }
    }
  };

  if (loading) {
    return (
      <Box className="fade-in">
        <Stack spacing={3}>
          {/* Header Skeleton */}
          <Box>
            <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={500} height={24} />
          </Box>
          
          {/* Button Skeleton */}
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
          
          {/* Cards Skeleton */}
          {[1, 2, 3].map((item) => (
            <Paper key={item} sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={200} height={24} />
                    <Skeleton variant="text" width={150} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Stack spacing={4}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <HistoryIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Search History
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Review your previous weather searches and access detailed forecast information
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleNewSearch}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            New Search
          </Button>
          {searches.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearHistory}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Clear History
            </Button>
          )}
        </Box>

        {/* Search/Filter Bar (Plus/Pro users only) */}
        {isPremium && (
          <Fade in={true}>
            <Box>
              <SearchFilterBar
                onSearchLocal={handleSearchLocal}
                onSearchBackend={handleSearchBackend}
                onClear={handleClearSearch}
                isSearching={isSearching}
                resultCount={searchText ? searches.length : null}
                source={searchSource}
                showBackendSearch={isPremium && searchText && searches.length === 0 && searchSource === 'localStorage'}
              />
            </Box>
          </Fade>
        )}

        {/* Search Results */}
        {searches.length === 0 ? (
          <Fade in={true}>
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(66, 165, 245, 0.02) 100%)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {searchText ? 'No Results Found' : 'No Search History'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto' }}>
                {searchText
                  ? `No searches found matching "${searchText}". Try a different search term.`
                  : "You haven't performed any weather searches yet. Create your first search to start building your forecast history."}
              </Typography>
              {!searchText && (
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleNewSearch}
                  size="large"
                  sx={{
                    mt: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Create Your First Search
                </Button>
              )}
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={3}>
            {/* Results Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {searchText ? 'Search Results' : 'Your Searches'}
                </Typography>
                <Chip
                  label={`${searches.length}${isPremium && totalSearches > searches.length ? ` of ${totalSearches}` : ''} search${searches.length > 1 ? 'es' : ''}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Divider />

            {/* Search Cards */}
            <Stack spacing={3}>
              {searches.map((search) => (
                <Fade in={true} key={search.id}>
                  <div>
                    <SearchSummaryCard
                      search={search}
                      onClick={handleSearchClick}
                      onEditSearch={handleEditSearch}
                      onDeleteSearch={handleDeleteSearch}
                      onRedoSearch={handleRedoSearch}
                      isRedoing={redoingSearchId === search.id}
                      isDeleting={deletingSearchId === search.id}
                    />
                  </div>
                </Fade>
              ))}
            </Stack>

            {/* Load More Button (Plus/Pro users only) */}
            {isPremium && hasMore && !searchText && (
              <Fade in={true}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={loadingMore ? <CircularProgress size={20} /> : <ExpandMoreIcon />}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderWidth: '1.5px',
                      '&:hover': {
                        borderWidth: '1.5px',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {loadingMore ? 'Loading...' : `Load ${Math.min(limit, totalSearches - searches.length)} More`}
                  </Button>
                </Box>
              </Fade>
            )}
          </Stack>
        )}

        {/* Error Alert */}
        {redoError && (
          <Fade in={true}>
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              onClose={() => setRedoError(null)}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Error:</strong> {redoError}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Success Alert */}
        {redoSuccess && (
          <Fade in={true}>
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Success!</strong> Weather data retrieved successfully. Redirecting to results...
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Info Alert */}
        {searches.length > 0 && (
          <Fade in={true}>
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '0.875rem' }
              }}
            >
              <Typography variant="body2">
                {isPremium ? (
                  <>
                    <strong>Premium Features:</strong> Your search history is synced across all your devices
                    and stored securely in the cloud. Use the search bar to find specific locations,
                    and load more searches as needed. Showing {searches.length} of {totalSearches} total searches.
                  </>
                ) : (
                  <>
                    <strong>Data Storage:</strong> Search history is stored locally in your browser (last 3 searches).
                    Clearing your browser cache or data will remove this information.
                    Upgrade to Plus or Pro for unlimited cloud storage and cross-device sync.
                  </>
                )}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
          open={redoLoading}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              minWidth: 300,
              backgroundColor: 'background.paper'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <CloudIcon
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  animation: `${pulse} 2s infinite`
                }}
              />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Redoing Weather Search
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {redoLoadingStep}
            </Typography>
            
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 6,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress size={24} thickness={4} />
            </Box>
          </Paper>
        </Backdrop>
      </Stack>
    </Box>
  );
}