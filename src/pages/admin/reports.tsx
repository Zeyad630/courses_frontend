import { usePageTitle } from 'src/hooks';

import { AdminReportsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function AdminReportsPage() {
  usePageTitle('System Reports');
  return <AdminReportsView />;
}
