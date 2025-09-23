import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Fade,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Cloud as CloudIcon
} from '@mui/icons-material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={300}>
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
  };
}

export default function AuthPage({ onAuthSuccess }) {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={(theme) => ({
            borderRadius: 4,
            overflow: 'hidden',
            background: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider'
          })}
        >
          {/* Header */}
          <Box
            sx={(theme) => ({
              p: 4,
              pb: 2,
              textAlign: 'center',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.02) 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider'
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CloudIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Motorcycle Weather
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Your trusted companion for weather-aware motorcycle journeys
            </Typography>
          </Box>

          {/* Message Alert */}
          {message && (
            <Box sx={{ px: 4, pb: 2 }}>
              <Fade in={true}>
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-message': { fontSize: '0.875rem' }
                  }}
                >
                  <Typography variant="body2">
                    {message}
                  </Typography>
                </Alert>
              </Fade>
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="authentication tabs"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2
                }
              }}
            >
              <Tab
                icon={<LoginIcon />}
                iconPosition="start"
                label="Sign In"
                {...a11yProps(0)}
              />
              <Tab
                icon={<PersonAddIcon />}
                iconPosition="start"
                label="Create Account"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            <TabPanel value={tabValue} index={0}>
              <LoginForm onSuccess={handleAuthSuccess} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <RegisterForm onSuccess={handleAuthSuccess} />
            </TabPanel>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              pt: 0,
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              background: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 ? (
                <>
                  Don't have an account?{' '}
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => setTabValue(1)}
                  >
                    Create one here
                  </Typography>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Typography
                    component="span"
                    color="primary"
                    sx={{ 
                      cursor: 'pointer', 
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => setTabValue(0)}
                  >
                    Sign in here
                  </Typography>
                </>
              )}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}