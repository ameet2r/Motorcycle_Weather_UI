import React from "react";
import {
  Box,
  Typography,
  Stack
} from "@mui/material";

export default function TermsOfServiceContent() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body2" paragraph>
          By accessing and using Motorcycle Weather ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          2. Description of Service
        </Typography>
        <Typography variant="body2" paragraph>
          Motorcycle Weather provides weather forecast information for locations within the United States and its territories. The Service retrieves data from the National Weather Service and presents it in a format convenient for motorcycle enthusiasts and outdoor adventurers.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          3. User Accounts
        </Typography>
        <Typography variant="body2" paragraph>
          To use the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          4. Weather Data Accuracy
        </Typography>
        <Typography variant="body2" paragraph>
          Weather forecasts are provided "as is" from the National Weather Service. While we strive to provide accurate and timely information, we make no warranties or guarantees regarding the accuracy, completeness, or reliability of weather data. Weather conditions can change rapidly, and forecasts may not always be accurate.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          5. Limitation of Liability
        </Typography>
        <Typography variant="body2" paragraph>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. You assume all risks associated with using weather forecast information for travel planning or outdoor activities. Motorcycle Weather shall not be liable for any damages, injuries, or losses resulting from your use of the Service or reliance on weather forecasts.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          6. User Responsibilities
        </Typography>
        <Typography variant="body2" paragraph>
          You agree to use the Service only for lawful purposes. You shall not:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Use the Service in any manner that could damage, disable, or impair the Service</li>
          <li>Attempt to reverse engineer or extract source code from the Service</li>
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          7. Membership and Service Features
        </Typography>
        <Typography variant="body2" paragraph>
          The Service is currently offered free of charge with a limit of 3 saved searches. Additional membership tiers and features may be introduced in the future. Any changes to membership benefits and limitations will be communicated with reasonable notice.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          8. Data Storage
        </Typography>
        <Typography variant="body2" paragraph>
          Search history and preferences are stored locally in your browser using localStorage. We are not responsible for data loss due to browser settings, cache clearing, or device issues.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          9. Termination
        </Typography>
        <Typography variant="body2" paragraph>
          We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, with or without notice. You may delete your account at any time through the account settings.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          10. Changes to Terms
        </Typography>
        <Typography variant="body2" paragraph>
          We reserve the right to modify these Terms of Service at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          11. Geographic Limitations
        </Typography>
        <Typography variant="body2" paragraph>
          The Service is limited to providing weather forecasts for locations within the United States and its territories, including Continental US, Alaska, Hawaii, Puerto Rico, US Virgin Islands, Guam, Northern Mariana Islands, and American Samoa.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          12. Open Source
        </Typography>
        <Typography variant="body2" paragraph>
          This Service is built on open source code available on GitHub. You may review, fork, or contribute to the source code subject to the repository's license terms. However, use of this hosted Service remains subject to these Terms of Service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          13. Contact Information
        </Typography>
        <Typography variant="body2" paragraph>
          If you have questions about these Terms of Service, please contact us through the Service interface or via the GitHub repository.
        </Typography>
      </Box>
    </Stack>
  );
}