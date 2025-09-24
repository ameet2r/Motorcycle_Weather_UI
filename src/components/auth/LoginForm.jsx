import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const { login, forgotPassword, error, setError, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    clearError();

    try {
      await login(formData.email, formData.password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is already set in AuthContext
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(forgotEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    clearError();
    setSuccessMessage(null);

    try {
      const message = await forgotPassword(forgotEmail);
      setSuccessMessage(message);
      setForgotEmail('');
    } catch (error) {
      // Error is already set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setSuccessMessage(null);
    clearError();
  };

  return (
    <Box component="form" onSubmit={showForgotPassword ? handleForgotSubmit : handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        textAlign: 'center',
        fontWeight: 700,
        mb: 3
      }}>
        {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{
        textAlign: 'center',
        mb: 4
      }}>
        {showForgotPassword ? 'Enter your email address and we\'ll send you a link to reset your password.' : 'Sign in to access your weather forecasts'}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => clearError()}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        value={showForgotPassword ? forgotEmail : formData.email}
        onChange={showForgotPassword ? (e) => setForgotEmail(e.target.value) : handleChange}
        disabled={loading}
        required
        autoComplete="email"
        sx={{ mb: showForgotPassword ? 4 : 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        error={!!error && (showForgotPassword ? !forgotEmail : !formData.email)}
        helperText={error && (showForgotPassword ? !forgotEmail : !formData.email) ? 'Email is required' : ''}
      />

      {!showForgotPassword && (
        <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        required
        autoComplete="current-password"
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
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : (showForgotPassword ? <EmailIcon /> : <LoginIcon />)}
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
        {loading ? (showForgotPassword ? 'Sending...' : 'Signing In...') : (showForgotPassword ? 'Send Reset Email' : 'Sign In')}
      </Button>

      {!showForgotPassword ? (
        <Button
          onClick={() => setShowForgotPassword(true)}
          variant="text"
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Forgot Password?
        </Button>
      ) : (
        <Button
          onClick={handleBackToLogin}
          variant="text"
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Back to Login
        </Button>
      )}
    </Box>
  );
}