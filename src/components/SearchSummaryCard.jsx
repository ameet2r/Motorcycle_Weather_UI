import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  CardActionArea,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { formatDateTime } from "../utils/dateTimeFormatters";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaunchIcon from '@mui/icons-material/Launch';
import ReplayIcon from '@mui/icons-material/Replay';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function SearchSummaryCard({ search, onClick, onEditSearch, onRedoSearch, onDeleteSearch, isRedoing, isDeleting }) {

  // Calculate day count across all locations
  const calculateDayCount = () => {
    let allDates = new Set();

    search.coordinates.forEach(coord => {
      Object.keys(coord.summary.dailySummaries).forEach(date => {
        allDates.add(date);
      });
    });

    return allDates.size;
  };

  const dayCount = calculateDayCount();

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header Section */}
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mb: 0.25 }}>
                {formatDateTime(search.timestamp)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${search.coordinates.length} location${search.coordinates.length > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
                <Chip
                  icon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${dayCount} day${dayCount > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.75rem' }}
                />
              </Box>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit Search">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSearch(search);
                }}
                size="small"
                sx={{
                  color: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText'
                  }
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Search">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSearch(search);
                }}
                disabled={isDeleting}
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'error.contrastText'
                  },
                  '&.Mui-disabled': {
                    color: 'action.disabled'
                  }
                }}
              >
                {isDeleting ? (
                  <CircularProgress size={18} />
                ) : (
                  <DeleteIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo Search">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onRedoSearch(search);
                }}
                disabled={isRedoing}
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                  },
                  '&.Mui-disabled': {
                    color: 'action.disabled'
                  }
                }}
              >
                <ReplayIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(search.id);
                }}
                size="small"
                sx={{
                  color: 'info.main',
                  '&:hover': {
                    backgroundColor: 'info.main',
                    color: 'info.contrastText'
                  }
                }}
              >
                <LaunchIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Main Content - Clickable Area */}
        <CardActionArea
          onClick={() => onClick(search.id)}
          sx={{
            borderRadius: 1.5,
            p: 2,
            mt: 1
          }}
        >
          <Stack spacing={1.5}>
            {/* Locations List */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Locations
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {search.coordinates.map((coord, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {coord.address || `${coord.latitude}, ${coord.longitude}`}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardActionArea>
      </CardContent>
    </Card>
  );
}