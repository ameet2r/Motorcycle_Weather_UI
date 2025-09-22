import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import ThemeProvider from './Themes/ThemeProvider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useState } from 'react';
import NewSearchPage from "./routes/NewSearchPage";
import PreviousSearchesPage from "./routes/PreviousSearchesPage";
import ForecastDetailsPage from "./routes/ForecastDetailsPage";
import Footer from "./components/Footer";
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CloudIcon from '@mui/icons-material/Cloud';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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

          {/* User Menu */}
          {user && (
            <>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getUserInitials(user.email)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    minWidth: 200,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getUserInitials(user.email)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Signed in
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function ProtectedApp() {
  return (
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
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle post-login redirect
  const handleAuthSuccess = () => {
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CloudIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h6" color="text.secondary">
          Loading Motorcycle Weather...
        </Typography>
      </Box>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show protected app if authenticated
  return (
    <ProtectedRoute>
      <ProtectedApp />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
