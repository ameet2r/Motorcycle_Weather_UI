import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  CardActionArea,
} from "@mui/material";
import {
  formatTemperatureRange,
  formatWindRange,
  formatPrecipitationRange,
  formatDateWithRelativeDay,
} from "../utils/forecastSummary";

export default function SearchSummaryCard({ search, onClick }) {

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinates = (coordinates) => {
    return coordinates.map(coord => `${coord.latitude}, ${coord.longitude}`).join(' • ');
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardActionArea onClick={() => onClick(search.id)}>
        <CardContent>
          <Stack spacing={2}>
            {/* Header with timestamp */}
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Search from {formatDateTime(search.timestamp)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search.coordinates.length} location{search.coordinates.length > 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Coordinates */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Coordinates:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCoordinates(search.coordinates)}
              </Typography>
            </Box>

            {/* Summary for each coordinate */}
            <Stack spacing={2}>
              {search.coordinates.map((coord, index) => (
                <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {coord.latitude}, {coord.longitude} (Elevation: {coord.elevation} ft)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {coord.summary.dayCount} day{coord.summary.dayCount > 1 ? 's' : ''} • {coord.summary.totalPeriods} periods
                  </Typography>
                  
                  {/* Daily summaries */}
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {Object.entries(coord.summary.dailySummaries)
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                      .map(([date, daySummary]) => (
                        <Box key={date} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" fontWeight="bold" gutterBottom>
                            {formatDateWithRelativeDay(date)} ({daySummary.periodCount} periods)
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                            <Chip
                              label={formatTemperatureRange(daySummary.tempRange)}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                            <Chip
                              label={formatWindRange(daySummary.windRange)}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                            <Chip
                              label={formatPrecipitationRange(daySummary.precipRange)}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ fontSize: '0.7rem', height: '20px' }}
                            />
                          </Stack>
                        </Box>
                      ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}