import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/simple-auth-context';

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: React.ReactNode;
};

const getPostAuthPath = (role: string | undefined) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'instructor') return '/instructor/courses';
  return '/dashboard';
};

export function GuestGuard({ children }: GuestGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getPostAuthPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user?.role]);

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

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
