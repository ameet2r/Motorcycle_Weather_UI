import { useUser } from '../contexts/UserContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Button
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import UpgradeIcon from '@mui/icons-material/Upgrade';

const MembershipPage = () => {
  const { userProfile, membershipTier } = useUser();

  const getTierColor = (tier) => {
    switch (tier) {
      case 'pro':
        return 'primary';
      case 'plus':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'pro':
        return 'Pro';
      case 'plus':
        return 'Plus';
      default:
        return 'Free';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Membership Management
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Membership
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={<StarIcon />}
              label={getTierLabel(membershipTier)}
              color={getTierColor(membershipTier)}
              variant="filled"
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {userProfile?.email}
            </Typography>
          </Box>
          <Typography variant="body2">
            We hope you are enjoying your {getTierLabel(membershipTier)} membership! Here are your current benefits:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 3 }}>
            {membershipTier === 'free' && (
              <>
                <li>Weather By Coordinate</li>
                <li>Hourly Forecasts</li>
                <li>Auto-save of your last three searches</li>
                <li>(Coming Soon) Weather by address</li>
              </>
            )}
            {membershipTier === 'plus' && (
              <>
                <li>All the features of Free tier</li>
                <li>No Ads</li>
                <li>Unlimited saved searches</li>
                <li>Searches synced across all devices</li>
                <li>Create routes and collections</li>
              </>
            )}
            {membershipTier === 'pro' && (
              <>
                <li>All the features of Free and Plus tiers</li>
                <li>Route-based forecasts with travel times</li>
                <li>Google Maps URL parsing to get waypoints</li>
                <li>Custom Alerts and notifications</li>
                <li>Radar and premium layers (wind, visibility, air quality)</li>
                <li>Offline mode (preload forecasts for trips)</li>
                <li>Severe weather alerts tailored to your route</li>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Membership Modification
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Membership upgrades and changes are coming soon! We're working hard to bring you
              seamless membership management directly from your dashboard.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            In the future, you'll be able to:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>Upgrade to higher tiers instantly</li>
            <li>Manage billing and payment methods</li>
            <li>Downgrade or cancel subscriptions</li>
            <li>Compare features of each tier</li>
          </Box>
          <Button
            variant="outlined"
            startIcon={<UpgradeIcon />}
            disabled
            sx={{ mt: 2 }}
          >
            Upgrade Membership (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MembershipPage;