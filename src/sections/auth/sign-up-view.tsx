import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconly } from 'src/components/iconly';

type Step = 'form' | 'otp';

export function SignUpView() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
      },
      '&.Mui-focused': {
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
      },
    },
  };

  const validateForm = () => {
    if (!name.trim()) return t('validation.required');
    if (!email.trim()) return t('validation.required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('validation.invalidEmail');
    if (!password) return t('validation.required');
    if (password.length < 8) return t('validation.passwordTooShort');
    if (password !== confirmPassword) return t('validation.passwordMismatch');
    return '';
  };

  const sendOtp = useCallback(async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || t('messages.savingError'));
      }

      const data = (await res.json()) as { token: string };
      setOtpToken(data.token);
      setStep('otp');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Failed to send email') {
          setError(t('auth.otpSendFailed'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('messages.savingError'));
      }
    } finally {
      setLoading(false);
    }
  }, [email, name, password, confirmPassword, t]);

  const verifyOtpAndCreateAccount = useCallback(async () => {
    if (!otpToken) {
      setError(t('messages.savingError'));
      return;
    }

    if (!otp.trim()) {
      setError(t('validation.required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, token: otpToken }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || t('auth.otpInvalid'));
      }

      await register({ email, name, password });
      router.push('/courses');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Email is already registered') {
          setError(t('auth.emailAlreadyRegistered'));
        } else if (err.message === 'OTP expired') {
          setError(t('auth.otpExpired'));
        } else if (err.message === 'Invalid OTP') {
          setError(t('auth.otpInvalid'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('messages.savingError'));
      }
    } finally {
      setLoading(false);
    }
  }, [email, name, otp, otpToken, password, register, router, t]);

  const renderHeader = (
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
          {step === 'form' ? t('auth.createAccountTitle') : t('auth.verifyEmailTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
          {step === 'form' ? t('auth.signUpDescription') : t('auth.verifyEmailDescription')}
        </Typography>
      </Box>
    </Box>
  );

  const renderFormStep = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="name"
        label={t('auth.fullName')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('auth.fullNamePlaceholder')}
        sx={inputSx}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconly name="Profile" size={20} sx={{ mr: 1, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        fullWidth
        name="email"
        label={t('auth.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        sx={inputSx}
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
      />

      <TextField
        fullWidth
        name="password"
        label={t('auth.password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        sx={inputSx}
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
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  <Iconly name={showPassword ? 'Show' : 'Hide'} size={20} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        sx={inputSx}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  <Iconly name={showConfirmPassword ? 'Show' : 'Hide'} size={20} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="button"
        variant="contained"
        onClick={sendOtp}
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
        {loading ? t('auth.sendingOtp') : t('auth.sendOtp')}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.alreadyHaveAccount')}{' '}
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
            {t('auth.signIn')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  const renderOtpStep = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Alert severity="info">{t('auth.otpSent')}</Alert>

      <TextField
        fullWidth
        name="otp"
        label={t('auth.otpCode')}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        sx={inputSx}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Button
        fullWidth
        type="button"
        variant="outlined"
        disabled={loading}
        onClick={() => {
          setOtp('');
          sendOtp();
        }}
        sx={{
          py: 1.2,
          fontWeight: 600,
          textTransform: 'none',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.lighter',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
          },
        }}
      >
        {loading ? t('auth.resendingOtp') : t('auth.resendOtp')}
      </Button>

      <Button
        fullWidth
        size="large"
        type="button"
        variant="contained"
        onClick={verifyOtpAndCreateAccount}
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
        {loading ? t('auth.verifyingOtp') : t('auth.verifyOtp')}
      </Button>

      <Button
        fullWidth
        type="button"
        variant="text"
        disabled={loading}
        onClick={() => {
          setStep('form');
          setOtp('');
          setOtpToken(null);
          setError('');
        }}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        {t('common.back')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {renderHeader}

      <Card
        sx={{
          p: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        {step === 'form' ? renderFormStep : renderOtpStep}
      </Card>
    </Box>
  );
}
