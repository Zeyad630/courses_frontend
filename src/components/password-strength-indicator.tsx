
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { getPasswordStrengthColor, getPasswordStrengthLabel, type PasswordStrength } from 'src/utils/password-strength';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const theme = useTheme();
  const progress = (strength.score / 4) * 100;
  const color = getPasswordStrengthColor(strength.score);
  const label = getPasswordStrengthLabel(strength.score);

  return (
    <Box sx={{ mt: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Password Strength
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
          {label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.divider, 0.2),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 1,
            transition: 'background-color 0.3s ease',
          },
        }}
      />
      {strength.feedback.length > 0 && strength.feedback[0] !== 'Strong password!' && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {strength.feedback.map((msg, idx) => (
              <span key={idx}>
                {idx > 0 && ' • '}
                {msg}
              </span>
            ))}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
