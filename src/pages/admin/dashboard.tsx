import { usePageTitle } from 'src/hooks';

import { AdminDashboardView } from 'src/sections/admin/view/admin-dashboard-view';

// ----------------------------------------------------------------------

export default function AdminDashboardPage() {
  usePageTitle('Admin Dashboard');
  return <AdminDashboardView />;
}
