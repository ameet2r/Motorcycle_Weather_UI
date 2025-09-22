import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not loading and no user, redirect to auth page
    if (!loading && !user) {
      // Store the current location so we can redirect back after login
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [user, loading, navigate, location]);

  // Show loading spinner while checking authentication
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
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If no user after loading is complete, don't render anything
  // (navigation to auth page will happen via useEffect)
  if (!user) {
    return null;
  }

  // User is authenticated, render the protected content
  return children;
}