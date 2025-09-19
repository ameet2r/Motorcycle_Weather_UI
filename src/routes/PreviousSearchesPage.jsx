import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Stack,
  Button,
  Box,
  Paper,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
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
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Loading search history...</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Previous Searches
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Click on any search to view detailed forecast information
        </Typography>
      </Box>

      {/* Action buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleNewSearch}
        >
          New Search
        </Button>
        {searches.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearHistory}
          >
            Clear History
          </Button>
        )}
      </Stack>

      {/* Search history */}
      {searches.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Previous Searches
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't performed any weather searches yet. Start by creating a new search to see your forecast history here.
          </Typography>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleNewSearch}
            sx={{ mt: 2 }}
          >
            Create Your First Search
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          <Typography variant="h6">
            {searches.length} search{searches.length > 1 ? 'es' : ''} found
          </Typography>
          {searches.map((search) => (
            <SearchSummaryCard
              key={search.id}
              search={search}
              onClick={handleSearchClick}
            />
          ))}
        </Stack>
      )}

      {/* Info alert */}
      {searches.length > 0 && (
        <Alert severity="info">
          Search history is stored locally in your browser. Clearing your browser cache will remove this data.
        </Alert>
      )}
    </Stack>
  );
}