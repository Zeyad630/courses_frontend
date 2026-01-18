import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { validatePassword } from 'src/utils/password-strength';

import { ApiError, ValidationError } from 'src/api/errors';
import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconly } from 'src/components/iconly';
import { PasswordStrengthIndicator } from 'src/components/password-strength-indicator';

export function SignUpView() {
  const router = useRouter();
  const theme = useTheme();
  const { register } = useAuth();
  const { t } = useTranslation();

  const getPostAuthPath = useCallback((role: string) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/courses';
    return '/dashboard';
  }, []);

  const brandGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  const [email, setEmail] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [educationalLevelId, setEducationalLevelId] = useState<number>(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [passwordStrength, setPasswordStrength] = useState(() => validatePassword(''));

  // Educational levels - adjust IDs based on your backend
  const educationalLevels = [
    { id: 25, label: 'Primary' },
    { id: 26, label: 'Preparatory' },
    { id: 27, label: 'High School' },
    { id: 28, label: 'University Undergraduate' },
    { id: 29, label: 'University Post Graduated' },
  ];

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

  const validateForm = useCallback(() => {
    const next: Partial<Record<string, string>> = {};

    const emailTrimmed = email.trim();
    const fullNameEnTrimmed = fullNameEn.trim();
    const fullNameArTrimmed = fullNameAr.trim();
    const nationalIdTrimmed = nationalId.trim();
    const phoneTrimmed = phone.trim();

    const englishNameRegex = /^[A-Za-z\s.'-]+$/;
    const arabicNameRegex = /^[\u0600-\u06FF\s]+$/;
    const nationalIdRegex = /^\d{14}$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!fullNameEnTrimmed) next.fullNameEn = t('validation.fullNameEnRequired');
    else if (!englishNameRegex.test(fullNameEnTrimmed)) next.fullNameEn = t('validation.invalidFullNameEn');

    if (!fullNameArTrimmed) next.fullNameAr = t('validation.fullNameArRequired');
    else if (!arabicNameRegex.test(fullNameArTrimmed)) next.fullNameAr = t('validation.invalidFullNameAr');

    if (!emailTrimmed) next.email = t('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) next.email = t('validation.invalidEmail');

    if (!nationalIdTrimmed) next.nationalId = t('validation.nationalIdRequired');
    else if (!nationalIdRegex.test(nationalIdTrimmed)) next.nationalId = t('validation.invalidNationalId');

    if (!phoneTrimmed) next.phone = t('validation.phoneRequired');
    else if (!phoneRegex.test(phoneTrimmed)) next.phone = t('validation.invalidPhone');

    if (!password) next.password = t('validation.required');
    else {
      const strength = validatePassword(password);
      if (!strength.isValid) next.password = strength.feedback[0] || t('validation.passwordTooShort');
    }

    if (!confirmPassword) next.confirmPassword = t('validation.required');
    else if (password !== confirmPassword) next.confirmPassword = t('validation.passwordMismatch');

    if (!educationalLevelId) next.educationalLevelId = t('validation.required');

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [confirmPassword, email, fullNameAr, fullNameEn, nationalId, password, phone, educationalLevelId, t]);

  const handleSignUp = useCallback(async () => {
    setError('');
    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const user = await register({
        email,
        password,
        nationalId,
        fullNameEn,
        fullNameAr,
        phone,
        educationalLevelId,
      });
      router.push(getPostAuthPath(user.role));
    } catch (err) {
      if (err instanceof ValidationError) {
        const next: Partial<Record<string, string>> = {};
        Object.entries(err.errors).forEach(([key, values]) => {
          next[key] = values?.[0] || t('messages.savingError') || 'Please check your input and try again.';
        });
        setFieldErrors(next);
        setError(t('messages.savingError') || 'Please check your input and try again.');
        return;
      }

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(t('auth.invalidCredentials') || 'Invalid credentials. Please try again.');
        } else if (err.message.includes('CORS') || err.message.includes('Network Error') || err.status === 0) {
          setError('Unable to connect to the server. Please ensure the backend server is running at https://localhost:7248');
        } else {
          setError(err.message || t('messages.savingError') || 'An error occurred. Please try again.');
        }
        return;
      }

      if (err instanceof Error) {
        if (err.message.includes('CORS') || err.message.includes('Network Error')) {
          setError('Unable to connect to the server. Please ensure the backend server is running at https://localhost:7248');
        } else {
          setError(err.message || 'An error occurred. Please try again.');
        }
      } else {
        setError(t('messages.savingError') || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, fullNameAr, fullNameEn, getPostAuthPath, nationalId, password, phone, educationalLevelId, register, router, t]);


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
            background: brandGradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('auth.createAccountTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
          {t('auth.signUpDescription')}
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
        name="fullNameEn"
        label="Full name (English)"
        value={fullNameEn}
        onChange={(e) => {
          setFullNameEn(e.target.value);
          if (fieldErrors.fullNameEn) setFieldErrors((prev) => ({ ...prev, fullNameEn: '' }));
        }}
        placeholder="John Doe"
        error={Boolean(fieldErrors.fullNameEn)}
        helperText={fieldErrors.fullNameEn || ''}
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

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField
          fullWidth
          name="nationalId"
          label="National ID"
          value={nationalId}
          onChange={(e) => {
            setNationalId(e.target.value);
            if (fieldErrors.nationalId) setFieldErrors((prev) => ({ ...prev, nationalId: '' }));
          }}
          placeholder="123456789"
          error={Boolean(fieldErrors.nationalId)}
          helperText={fieldErrors.nationalId || ''}
          sx={inputSx}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          name="phone"
          label="Phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
          }}
          placeholder="+1234567890"
          error={Boolean(fieldErrors.phone)}
          helperText={fieldErrors.phone || ''}
          sx={inputSx}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <TextField
        fullWidth
        name="fullNameAr"
        label="Full name (Arabic)"
        value={fullNameAr}
        onChange={(e) => {
          setFullNameAr(e.target.value);
          if (fieldErrors.fullNameAr) setFieldErrors((prev) => ({ ...prev, fullNameAr: '' }));
        }}
        placeholder="جون دو"
        error={Boolean(fieldErrors.fullNameAr)}
        helperText={fieldErrors.fullNameAr || ''}
        sx={inputSx}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        fullWidth
        name="email"
        label={t('auth.email')}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
        }}
        placeholder="you@example.com"
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email || ''}
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

      <Box>
        <TextField
          fullWidth
          name="password"
          label={t('auth.password')}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(validatePassword(e.target.value));
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
          }}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password || ''}
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
        {password && <PasswordStrengthIndicator strength={passwordStrength} />}
      </Box>

      <TextField
        fullWidth
        name="confirmPassword"
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }}
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        error={Boolean(fieldErrors.confirmPassword)}
        helperText={fieldErrors.confirmPassword || ''}
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

      <FormControl fullWidth error={Boolean(fieldErrors.educationalLevelId)}>
        <InputLabel shrink>Educational Level</InputLabel>
        <Select
          value={educationalLevelId}
          onChange={(e) => {
            setEducationalLevelId(Number(e.target.value));
            if (fieldErrors.educationalLevelId) setFieldErrors((prev) => ({ ...prev, educationalLevelId: '' }));
          }}
          label="Educational Level"
          sx={inputSx}
        >
          {educationalLevels.map((level) => (
            <MenuItem key={level.id} value={level.id}>
              {level.label}
            </MenuItem>
          ))}
        </Select>
        {fieldErrors.educationalLevelId && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
            {fieldErrors.educationalLevelId}
          </Typography>
        )}
      </FormControl>

      <Button
        fullWidth
        size="large"
        type="button"
        variant="contained"
        onClick={handleSignUp}
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
        {loading ? t('auth.creatingAccount') || 'Creating Account...' : t('auth.signUp') || 'Sign Up'}
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


  return (
    <Box sx={{ width: '100%', maxWidth: 680, mx: 'auto' }}>
      {renderHeader}

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
        {renderFormStep}
      </Card>
    </Box>
  );
}
