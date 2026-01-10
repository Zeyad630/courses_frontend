import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { authApi } from 'src/api';

import { Iconly } from 'src/components/iconly';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const brandGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

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
            {t('auth.forgotPassword') || 'Forgot Password?'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
            {t('auth.forgotPasswordDescription') ||
              'Enter your email address and we will send you a link to reset your password.'}
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
        {success ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert severity="success" sx={{ mb: 1 }}>
              {t('auth.passwordResetEmailSent') ||
                'If the email exists, a password reset link has been sent. Please check your inbox.'}
            </Alert>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push('/sign-in')}
              sx={{
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('auth.backToSignIn') || 'Back to Sign In'}
            </Button>
          </Box>
        ) : (
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
              onKeyPress={handleKeyPress}
              placeholder="you@example.com"
              autoFocus
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

            <Button
              fullWidth
              size="large"
              type="button"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
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
              {loading ? t('auth.sending') || 'Sending...' : t('auth.sendResetLink') || 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('auth.rememberPassword') || 'Remember your password?'}{' '}
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
        )}
      </Card>
    </Box>
  );
}
