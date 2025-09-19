import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import ThemeProvider from './Themes/ThemeProvider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import NewSearchPage from "./routes/NewSearchPage";
import PreviousSearchesPage from "./routes/PreviousSearchesPage";
import ForecastDetailsPage from "./routes/ForecastDetailsPage";
import Footer from "./components/Footer";
import CloudIcon from '@mui/icons-material/Cloud';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';

function NavigationBar() {
  const location = useLocation();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{
              mr: 2,
              p: 1,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <CloudIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </IconButton>
          <Box>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                textDecoration: 'none',
                color: 'inherit',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }
              }}
            >
              Motorcycle Weather
            </Typography>
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Create New Search">
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<SearchIcon />}
              variant={location.pathname === '/' ? 'outlined' : 'text'}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                New Search
              </Box>
            </Button>
          </Tooltip>
          <Tooltip title="View Previous Searches">
            <Button
              color="inherit"
              component={Link}
              to="/previous-searches"
              startIcon={<HistoryIcon />}
              variant={location.pathname === '/previous-searches' ? 'outlined' : 'text'}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                History
              </Box>
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavigationBar />
          
          <Container
            maxWidth="lg"
            sx={{
              flex: 1,
              py: { xs: 3, sm: 4 },
              px: { xs: 2, sm: 3 }
            }}
            className="fade-in"
          >
            <Routes>
              <Route path="/" element={<NewSearchPage />} />
              <Route path="/previous-searches" element={<PreviousSearchesPage />} />
              <Route path="/forecast/:searchId" element={<ForecastDetailsPage />} />
            </Routes>
          </Container>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}
