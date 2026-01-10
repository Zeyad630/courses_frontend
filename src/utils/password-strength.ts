/**
 * Password strength validation and utilities
 */

export interface PasswordStrength {
  score: number; // 0-4 (0: weak, 4: very strong)
  feedback: string[];
  isValid: boolean;
}

const MIN_PASSWORD_LENGTH = 8;

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ['Password is required'], isValid: false };
  }

  // Length check
  if (password.length < MIN_PASSWORD_LENGTH) {
    feedback.push(`At least ${MIN_PASSWORD_LENGTH} characters`);
  } else {
    score += 1;
    if (password.length >= 12) {
      score += 0.5;
    }
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('One lowercase letter');
  } else {
    score += 0.5;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('One uppercase letter');
  } else {
    score += 0.5;
  }

  // Digit check
  if (!/[0-9]/.test(password)) {
    feedback.push('One number');
  } else {
    score += 0.5;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':\\|,.<>/?]/.test(password)) {
    feedback.push('One special character');
  } else {
    score += 0.5;
  }

  // Length bonus
  if (password.length >= 16) {
    score += 0.5;
  }

  // Complexity bonus (if has all character types)
  if (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};':\\|,.<>/?]/.test(password)
  ) {
    score += 0.5;
  }

  const finalScore = Math.min(Math.floor(score), 4);
  const isValid = feedback.length === 0 && password.length >= MIN_PASSWORD_LENGTH;

  return {
    score: finalScore,
    feedback: feedback.length > 0 ? feedback : ['Strong password!'],
    isValid,
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score === 0) return '#ef4444'; // red
  if (score === 1) return '#f97316'; // orange
  if (score === 2) return '#eab308'; // yellow
  if (score === 3) return '#22c55e'; // green
  return '#16a34a'; // dark green
};

export const getPasswordStrengthLabel = (score: number): string => {
  if (score === 0) return 'Very Weak';
  if (score === 1) return 'Weak';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Strong';
};
