import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(i18n.language);

  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      setError(t('auth.pleaseEnterBoth'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router, t]);

  const handleLanguageChange = (event: React.MouseEvent<HTMLElement>, newLanguage: string | null) => {
    if (newLanguage) {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    }
  };

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
                <Iconify icon="solar:pen-bold" width={20} sx={{ mr: 1, color: 'text.secondary' }} />
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
            href="#"
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
                  <Iconify icon="solar:eye-bold" width={20} sx={{ mr: 1, color: 'text.secondary' }} />
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
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={20} />
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
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <ToggleButtonGroup
          value={language}
          exclusive
          onChange={handleLanguageChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="en">{t('common.english')}</ToggleButton>
          <ToggleButton value="ar">{t('common.arabic')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
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
          {t('auth.continueWith')}
        </Typography>
      </Divider>

      {/* Social Login Buttons */}
      <Box
        sx={{
          gap: 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          mb: 3,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          sx={{
            py: 1.2,
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
            },
          }}
        >
          <Iconify width={24} icon="socials:google" />
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            py: 1.2,
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
            },
          }}
        >
          <Iconify width={24} icon="socials:github" />
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            py: 1.2,
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
            },
          }}
        >
          <Iconify width={24} icon="socials:twitter" />
        </Button>
      </Box>

      {/* Sign Up Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.dontHaveAccount')}{' '}
          <Link
            href="#"
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

      {/* Demo Credentials Info */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'primary.lighter',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'primary.dark' }}>
          {t('auth.demoCredentials')}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'primary.dark' }}>
          • {t('auth.admin')}: admin@school.com / admin123
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'primary.dark' }}>
          • {t('auth.instructor')}: instructor@school.com / instructor123
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'primary.dark' }}>
          • {t('auth.student')}: student@school.com / student123
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'primary.dark', mt: 1 }}>
          • {t('auth.demo')}: hello@gmail.com / @demo1234
        </Typography>
      </Box>
    </Box>
  );
}
