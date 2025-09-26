import React, { useState, useEffect } from 'react';
import { Backdrop, Paper, Typography } from '@mui/material';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * ConnectivityGate component that enforces internet connectivity rules based on membership tier
 * @param {string} membershipTier - User's membership tier ('free', 'plus', 'pro')
 * @param {ReactNode} children - Child components to render when access is allowed
 */
const ConnectivityGate = ({ membershipTier, children }) => {
  const isOnline = useOnlineStatus();
  const [showOverlay, setShowOverlay] = useState(false);
  const [graceTimer, setGraceTimer] = useState(null);

  // Prevent back button navigation when overlay is shown
  useEffect(() => {
    if (!showOverlay) return;

    const handlePopState = (e) => {
      // Prevent the navigation and restore the current URL
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showOverlay]);

  useEffect(() => {
    // For paid tiers, always allow access
    if (membershipTier !== 'free') {
      setShowOverlay(false);
      if (graceTimer) {
        clearTimeout(graceTimer);
        setGraceTimer(null);
      }
      return;
    }

    // For free tier
    if (!isOnline) {  
      // Start 30-second grace period before showing overlay
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 300000);
      setGraceTimer(timer);
    } else {
      // Online, hide overlay and clear any pending timer
      setShowOverlay(false);
      if (graceTimer) {
        clearTimeout(graceTimer);
        setGraceTimer(null);
      }
    }

    // Cleanup timer on unmount or dependency change
    return () => {
      if (graceTimer) {
        clearTimeout(graceTimer);
      }
    };
  }, [isOnline, membershipTier]);

  // Show blocking overlay for free tier when offline after grace period
  if (showOverlay) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: 9999,
          color: '#fff'
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom color="text.primary">
            Internet Connection Required
          </Typography>
          <Typography variant="body1" color="text.secondary">
            An internet connection is required to use the Free tier. Please reconnect or upgrade to Paid for offline access.
          </Typography>
        </Paper>
      </Backdrop>
    );
  }

  // Allow access
  return children;
};

export default ConnectivityGate;