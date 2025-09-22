import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: 'error' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };

    // Base score for length
    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.symbols) score += 20;

    let label = '';
    let color = 'error';

    if (score < 40) {
      label = 'Weak';
      color = 'error';
    } else if (score < 60) {
      label = 'Fair';
      color = 'warning';
    } else if (score < 80) {
      label = 'Good';
      color = 'info';
    } else {
      label = 'Strong';
      color = 'success';
    }

    return { score, label, color, checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        textAlign: 'center', 
        fontWeight: 700,
        mb: 3
      }}>
        Create Account
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ 
        textAlign: 'center', 
        mb: 4 
      }}>
        Join us to access personalized weather forecasts
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
        required
        autoComplete="email"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        error={!!error && !formData.email}
        helperText={error && !formData.email ? 'Email is required' : ''}
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        required
        autoComplete="new-password"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                edge="end"
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        error={!!error && !formData.password}
        helperText={error && !formData.password ? 'Password is required' : ''}
      />

      {/* Password Strength Indicator */}
      {formData.password && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Password Strength:
            </Typography>
            <Chip 
              label={passwordStrength.label} 
              color={passwordStrength.color}
              size="small"
              variant="outlined"
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={passwordStrength.score} 
            color={passwordStrength.color}
            sx={{ height: 6, borderRadius: 3, mb: 2 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={passwordStrength.checks.length ? <CheckIcon /> : <CloseIcon />}
              label="8+ characters"
              size="small"
              color={passwordStrength.checks.length ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              icon={passwordStrength.checks.lowercase ? <CheckIcon /> : <CloseIcon />}
              label="Lowercase"
              size="small"
              color={passwordStrength.checks.lowercase ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              icon={passwordStrength.checks.uppercase ? <CheckIcon /> : <CloseIcon />}
              label="Uppercase"
              size="small"
              color={passwordStrength.checks.uppercase ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              icon={passwordStrength.checks.numbers ? <CheckIcon /> : <CloseIcon />}
              label="Numbers"
              size="small"
              color={passwordStrength.checks.numbers ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip
              icon={passwordStrength.checks.symbols ? <CheckIcon /> : <CloseIcon />}
              label="Symbols"
              size="small"
              color={passwordStrength.checks.symbols ? 'success' : 'default'}
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
        required
        autoComplete="new-password"
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={toggleConfirmPasswordVisibility}
                edge="end"
                disabled={loading}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        error={!formData.confirmPassword && formData.password !== formData.confirmPassword}
        helperText={
          formData.confirmPassword && formData.password !== formData.confirmPassword 
            ? 'Passwords do not match' 
            : ''
        }
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading || passwordStrength.score < 20}
        startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
            transform: 'translateY(-2px)'
          },
          '&:disabled': {
            backgroundColor: 'action.disabledBackground',
            color: 'action.disabled',
            transform: 'none',
            boxShadow: 'none'
          }
        }}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Box>
  );
}