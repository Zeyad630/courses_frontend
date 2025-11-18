import { usePageTitle } from 'src/hooks';

import { NotificationsView } from 'src/sections/notifications/view/notifications-view';

// ----------------------------------------------------------------------

export default function NotificationsPage() {
  usePageTitle('Notifications');
  return <NotificationsView />;
}
