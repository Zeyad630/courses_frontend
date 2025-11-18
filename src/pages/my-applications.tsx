import { usePageTitle } from 'src/hooks';

import { MyApplicationsView } from 'src/sections/applications/view/my-applications-view';

// ----------------------------------------------------------------------

export default function MyApplicationsPage() {
  usePageTitle('My Applications');
  return <MyApplicationsView />;
}
