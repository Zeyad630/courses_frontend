import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { validatePassword } from 'src/utils/password-strength';

import { authApi } from 'src/api';

import { Iconly } from 'src/components/iconly';
import { PasswordStrengthIndicator } from 'src/components/password-strength-indicator';

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const brandGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(
    validatePassword('')
  );

  // Extract token and email from URL query params
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(decodeURIComponent(urlEmail));
  }, [searchParams]);

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    setPasswordStrength(validatePassword(newPassword));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!token.trim()) {
      setError('Reset token is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Please enter a stronger password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        email,
        token,
        newPassword: password,
      });
      setSuccess(true);
      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, token, password, confirmPassword, passwordStrength, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            gap: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: brandGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Password Reset Successful!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
              Your password has been reset successfully. Redirecting to sign in...
            </Typography>
          </Box>
        </Box>
        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            boxShadow: theme.shadows[6],
          }}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            Your password has been reset successfully!
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push('/sign-in')}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: brandGradient,
              boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.28)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 14px 34px ${alpha(theme.palette.primary.main, 0.35)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Go to Sign In
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: brandGradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Reset Your Password
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
            Enter your new password below
          </Typography>
        </Box>
      </Box>

      {/* Form Card */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(10px)',
          boxShadow: theme.shadows[6],
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            name="email"
            label={t('auth.email') || 'Email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!searchParams.get('email')}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconly name="Message" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
                },
              },
            }}
          />

          {!searchParams.get('token') && (
            <TextField
              fullWidth
              name="token"
              label="Reset Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter reset token from email"
              autoFocus
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconly name="Lock" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          <TextField
            fullWidth
            name="password"
            label={t('auth.password') || 'New Password'}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus={!!searchParams.get('token')}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconly name="Lock" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      <Iconly name={showPassword ? 'Hide' : 'Show'} size={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
                },
              },
            }}
          />

          {password && <PasswordStrengthIndicator strength={passwordStrength} />}

          <TextField
            fullWidth
            name="confirmPassword"
            label={t('auth.confirmPassword') || 'Confirm Password'}
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconly name="Lock" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      <Iconly name={showConfirmPassword ? 'Hide' : 'Show'} size={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
                },
              },
            }}
          />

          <Button
            fullWidth
            size="large"
            type="button"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !passwordStrength.isValid || password !== confirmPassword}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: brandGradient,
              boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.28)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 14px 34px ${alpha(theme.palette.primary.main, 0.35)}`,
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: brandGradient,
                opacity: 0.7,
              },
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Remember your password?{' '}
              <Link
                component={RouterLink}
                href="/sign-in"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('auth.signIn') || 'Sign In'}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
