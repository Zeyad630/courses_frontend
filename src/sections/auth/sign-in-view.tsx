import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useGoogleAuth } from 'src/hooks/use-google-auth';

import { ApiError } from 'src/api/errors';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconly } from 'src/components/iconly';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const theme = useTheme();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useTranslation();

  const getPostAuthPath = useCallback((role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/courses';
    return '/dashboard';
  }, []);

  const brandGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Google OAuth error handler
  const handleGoogleError = useCallback(
    (err: Error) => {
      setGoogleLoading(false);
      setError(err.message || 'Google authentication failed');
    },
    []
  );

  // Google OAuth success callback - receives the idToken (credential) from Google
  const handleGoogleCallback = useCallback(
    async (credential: string) => {
      try {
        setGoogleLoading(true);
        setError('');
        
        // Use the auth context's loginWithGoogle method which handles:
        // 1. Sending idToken to backend
        // 2. Getting access token and user info
        // 3. Fetching full profile
        // 4. Updating auth context state
        const user = await loginWithGoogle(credential);
        
        setGoogleLoading(false);
        
        // Redirect after successful login
        router.push(getPostAuthPath(user.role));
      } catch (err) {
        setGoogleLoading(false);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Google authentication failed');
        }
      }
    },
    [getPostAuthPath, loginWithGoogle, router]
  );

  const { signInWithGoogle, isGoogleLoaded } = useGoogleAuth(handleGoogleCallback, handleGoogleError);

  const handleGoogleSignIn = useCallback(async () => {
    if (!isGoogleLoaded) {
      setError('Google authentication is loading. Please try again in a moment.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [signInWithGoogle, isGoogleLoaded]);

  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      setError(t('auth.pleaseEnterBoth'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      router.push(getPostAuthPath(user.role));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(t('auth.invalidCredentials') || 'Invalid email or password. Please try again.');
        } else if (err.message.includes('Email is not verified')) {
          setError(t('auth.emailNotVerified') || 'Please verify your email before signing in.');
        } else if (err.message.includes('CORS') || err.message.includes('Network Error') || err.status === 0) {
          setError('Unable to connect to the server. Please ensure the backend server is running at https://localhost:7248');
        } else {
          setError(err.message || t('messages.savingError') || 'An error occurred. Please try again.');
        }
        return;
      }

      if (err instanceof Error) {
        if (err.message.includes('Email is not verified')) {
          setError(t('auth.emailNotVerified') || 'Please verify your email before signing in.');
          return;
        }

        if (err.message.toLowerCase().includes('network') || err.message.includes('CORS')) {
          setError('Unable to connect to the server. Please ensure the backend server is running at https://localhost:7248');
          return;
        }

        setError(err.message || 'An error occurred. Please try again.');
        return;
      }

      setError(t('auth.invalidCredentials') || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, getPostAuthPath, login, router, t]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const renderForm = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label={t('auth.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="you@example.com"
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

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('auth.password')}
          </Typography>
          <Link
            component={RouterLink}
            href="/forgot-password"
            variant="caption"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('auth.forgotPassword')}
          </Link>
        </Box>
        <TextField
          fullWidth
          name="password"
          label={t('auth.enterPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconly name="Password" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    <Iconly name={showPassword ? 'Show' : 'Hide'} size={20} />
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
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            sx={{
              color: 'text.secondary',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        }
        label={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('auth.rememberMe')}
          </Typography>
        }
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading}
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
        {loading ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Language Toggle */}
      <Box sx={{ display: 'none' }} />

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
            {t('auth.welcomeBack')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }}>
            {t('auth.signInDescription')}
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
        {renderForm}
      </Card>

      {/* Divider with OR */}
      <Divider
        sx={{
          my: 3,
          '&::before, &::after': { borderTopStyle: 'dashed' },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {t('auth.orContinueWith') || 'OR'}
        </Typography>
      </Divider>

      {/* Google Sign In Button */}
      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        startIcon={<Iconify width={24} icon="flat-color-icons:google" />}
        sx={{
          py: 1.5,
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          border: '2px solid',
          borderColor: 'divider',
          color: 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
          '&:disabled': {
            opacity: 0.6,
          },
        }}
      >
        {googleLoading ? t('auth.signingInWithGoogle') : t('auth.continueWithGoogle')}
      </Button>

      {/* Sign Up Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.dontHaveAccount')}{' '}
          <Link
            component={RouterLink}
            href="/sign-up"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('auth.createOne')}
          </Link>
        </Typography>
      </Box>

    </Box>
  );
}
