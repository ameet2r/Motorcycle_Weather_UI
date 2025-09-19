import { useState, useEffect } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import { getSearchHistory, clearSearchHistory } from "../utils/localStorage";
import SearchSummaryCard from "../components/SearchSummaryCard";

export default function PreviousSearchesPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    setLoading(true);
    try {
      const history = getSearchHistory();
      setSearches(history);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (searchId) => {
    navigate(`/forecast/${searchId}`);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      const success = clearSearchHistory();
      if (success) {
        setSearches([]);
      } else {
        console.error('Failed to clear search history');
      }
    }
  };

  const handleNewSearch = () => {
    navigate('/');
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
                No Search History
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto' }}>
                You haven't performed any weather searches yet. Create your first search to start building your forecast history.
              </Typography>
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
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={3}>
            {/* Results Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Search Results
                </Typography>
                <Chip
                  label={`${searches.length} search${searches.length > 1 ? 'es' : ''}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <Divider />

            {/* Search Cards */}
            <Stack spacing={3}>
              {searches.map((search, index) => (
                <Fade in={true} key={search.id} timeout={300 + index * 100}>
                  <div>
                    <SearchSummaryCard
                      search={search}
                      onClick={handleSearchClick}
                    />
                  </div>
                </Fade>
              ))}
            </Stack>
          </Stack>
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
                <strong>Data Storage:</strong> Search history is stored locally in your browser.
                Clearing your browser cache or data will remove this information.
              </Typography>
            </Alert>
          </Fade>
        )}
      </Stack>
    </Box>
  );
}