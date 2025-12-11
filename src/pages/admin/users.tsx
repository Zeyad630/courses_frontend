import { usePageTitle } from 'src/hooks';

import { AdminUsersView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function AdminUsersPage() {
  usePageTitle('Users Management');
  return <AdminUsersView />;
}
