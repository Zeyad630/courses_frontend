import { useRouter } from 'src/routes/hooks';

import { usePageTitle } from 'src/hooks';
import { useAuth } from 'src/contexts/simple-auth-context';

import { RoleDashboardView } from 'src/sections/dashboard/view/role-dashboard-view';

// ----------------------------------------------------------------------

export default function DashboardPage() {
  usePageTitle('Dashboard');

  const router = useRouter();
  const { hasRole } = useAuth();

  if (hasRole('student')) {
    router.replace('/courses');
    return null;
  }

  return <RoleDashboardView />;
}
