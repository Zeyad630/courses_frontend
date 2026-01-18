import type { UserRole } from 'src/types/user';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/simple-auth-context';

// ----------------------------------------------------------------------

type RoleGuardProps = {
  roles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
};

export function RoleGuard({ roles, children, redirectTo = '/dashboard' }: RoleGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/sign-in', { replace: true });
      return;
    }

    if (user && !roles.includes(user.role)) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, roles, user]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
