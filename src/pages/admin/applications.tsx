import { usePageTitle } from 'src/hooks';

import { AdminApplicationsView } from 'src/sections/admin/view/admin-applications-view';

// ----------------------------------------------------------------------

export default function AdminApplicationsPage() {
  usePageTitle('Review Applications');
  return <AdminApplicationsView />;
}
