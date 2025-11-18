import { usePageTitle } from 'src/hooks';

import { RoleDashboardView } from 'src/sections/dashboard/view/role-dashboard-view';

// ----------------------------------------------------------------------

export default function DashboardPage() {
  usePageTitle('Dashboard');
  return <RoleDashboardView />;
}
