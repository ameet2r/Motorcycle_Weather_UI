import React from "react";
import {
  Box,
  Typography,
  Stack
} from "@mui/material";

export default function PrivacyPolicyContent() {
  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          1. Information We Collect
        </Typography>
        <Typography variant="body2" paragraph sx={{ fontWeight: 600 }}>
          Account Information:
        </Typography>
        <Typography variant="body2" paragraph>
          When you create an account, we collect your email address and password. This information is managed by Google Firebase Authentication, which handles all credential storage using industry best practices including secure hashing. Your email is also stored in Google Firestore to manage your membership tier.
        </Typography>
        <Typography variant="body2" paragraph sx={{ fontWeight: 600 }}>
          Location and Weather Data:
        </Typography>
        <Typography variant="body2" paragraph>
          When you search for weather forecasts, you provide geographic coordinates or addresses. This location data and the resulting weather forecasts are temporarily cached on Google Firestore. Data is automatically deleted when it becomes stale, based on the Time-To-Live (TTL) value provided by the National Weather Service with each forecast.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
          <li>To provide and maintain the Service</li>
          <li>To authenticate your identity and manage your account</li>
          <li>To retrieve weather forecasts for your requested locations</li>
          <li>To enforce membership tier limits and features</li>
          <li>To improve and optimize the Service</li>
          <li>To communicate with you about the Service</li>
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          3. Data Storage
        </Typography>
        <Typography variant="body2" paragraph sx={{ fontWeight: 600 }}>
          Local Storage:
        </Typography>
        <Typography variant="body2" paragraph>
          Search history and preferences are stored locally in your browser using localStorage. This data remains on your device and you can clear it at any time through your browser settings.
        </Typography>
        <Typography variant="body2" paragraph sx={{ fontWeight: 600 }}>
          Google Firebase Storage:
        </Typography>
        <Typography variant="body2" paragraph>
          Your account credentials (email and password) are managed by Google Firebase Authentication, which uses industry-standard security practices including password hashing and encryption. Your email address and membership tier information are stored in Google Firestore. Weather forecast data and coordinates are temporarily cached in Google Firestore and automatically deleted when the data becomes stale (based on TTL values from weather.gov). Firebase provides enterprise-grade security and data protection.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          4. Data Sharing
        </Typography>
        <Typography variant="body2" paragraph>
          We do not sell, trade, or rent your personal information to third parties. We may share data with:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
          <li><strong>National Weather Service:</strong> We send location coordinates to retrieve weather forecasts</li>
          <li><strong>Google Maps API:</strong> When you use address search, location data is sent to Google's Places API</li>
          <li><strong>Service Providers:</strong> We may use third-party services to help operate the Service (e.g., hosting, authentication)</li>
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          5. Authentication and Security
        </Typography>
        <Typography variant="body2" paragraph>
          User authentication is handled entirely by Google Firebase Authentication. Firebase securely stores passwords using industry-standard bcrypt hashing and never stores passwords in plain text. Authentication tokens are managed by Firebase and expire after a period of inactivity. All data transmission occurs over secure HTTPS connections. You are responsible for keeping your credentials confidential.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          6. Cookies and Tracking
        </Typography>
        <Typography variant="body2" paragraph>
          We use localStorage to store your preferences and search history locally on your device. We may use authentication cookies to maintain your login session. We do not use third-party tracking or advertising cookies.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          7. Data Retention
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Local Browser Storage:</strong> Search history stored locally in your browser is currently limited to your last 3 searches. When this limit is exceeded, older searches are automatically deleted.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Firebase Storage:</strong> Your account information (email and password hash in Firebase Authentication; email and membership tier in Firestore) is retained in Firebase until you delete your account. Weather forecast data and coordinates cached in Google Firestore are automatically deleted when they become stale, as determined by the Time-To-Live (TTL) values provided by weather.gov. This typically ranges from a few hours to a day depending on the forecast type.
        </Typography>
        <Typography variant="body2" paragraph>
          Future membership tiers may offer different local storage limits.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          8. Your Rights
        </Typography>
        <Typography variant="body2" paragraph>
          You have the right to:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
          <li>Access your personal information</li>
          <li>Delete your account and associated data</li>
          <li>Clear your local search history at any time</li>
          <li>Opt out of the Service by deleting your account</li>
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          9. Data Security
        </Typography>
        <Typography variant="body2" paragraph>
          We use Google Firebase and Google Firestore for all server-side data storage, which provides enterprise-grade security including:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
          <li>Industry-standard password hashing (bcrypt)</li>
          <li>Encrypted data transmission (HTTPS/TLS)</li>
          <li>Encrypted data at rest</li>
          <li>Regular security audits by Google</li>
          <li>DDoS protection and threat detection</li>
        </Typography>
        <Typography variant="body2" paragraph>
          However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          10. Children's Privacy
        </Typography>
        <Typography variant="body2" paragraph>
          The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          11. Changes to Privacy Policy
        </Typography>
        <Typography variant="body2" paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          12. Open Source Transparency
        </Typography>
        <Typography variant="body2" paragraph>
          This Service is built on open source code publicly available on GitHub. You can review our data handling practices, security implementations, and code directly in the repository. This transparency allows you to verify how your data is processed and stored.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          13. Contact Us
        </Typography>
        <Typography variant="body2" paragraph>
          If you have questions or concerns about this Privacy Policy or our data practices, please contact us through the Service interface or via the GitHub repository.
        </Typography>
      </Box>
    </Stack>
  );
}