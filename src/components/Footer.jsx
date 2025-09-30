import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import CloudIcon from '@mui/icons-material/Cloud';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';
import TermsOfServiceContent from './TermsOfService';
import PrivacyPolicyContent from './PrivacyPolicy';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [tosOpen, setTosOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  
  const supportedRegions = [
    "Continental US",
    "Alaska",
    "Hawaii",
    "Puerto Rico",
    "US Virgin Islands",
    "Guam",
    "Northern Mariana Islands",
    "American Samoa"
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Main Footer Content */}
          <Box sx={{ textAlign: 'center' }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CloudIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Motorcycle Weather
              </Typography>
            </Box>
            
            {/* Service Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Weather forecasting service providing detailed meteorological data
              for motorcycle enthusiasts and outdoor adventurers across US territories.
            </Typography>
          </Box>

          <Divider />

          {/* Coverage Information */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <PublicIcon sx={{ fontSize: 20, color: 'info.main', mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Service Coverage Areas
              </Typography>
            </Box>
            
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              {supportedRegions.map((region, index) => (
                <Chip
                  key={index}
                  label={region}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: 'info.main',
                      color: 'info.contrastText'
                    }
                  }}
                />
              ))}
            </Stack>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InfoIcon sx={{ fontSize: 16, color: 'warning.main', mr: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Weather data retrieval is limited to the regions listed above
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Copyright and Legal */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              © {currentYear} Motorcycle Weather. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Weather data provided by the National Weather Service.
              <Link
                component="button"
                onClick={() => setTosOpen(true)}
                color="primary"
                sx={{
                  ml: 1,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms of Service
              </Link>
              {' • '}
              <Link
                component="button"
                onClick={() => setPrivacyOpen(true)}
                color="primary"
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Terms of Service Dialog */}
      <Dialog
        open={tosOpen}
        onClose={() => setTosOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
          Terms of Service
          <IconButton
            onClick={() => setTosOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TermsOfServiceContent />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTosOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
          Privacy Policy
          <IconButton
            onClick={() => setPrivacyOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <PrivacyPolicyContent />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}