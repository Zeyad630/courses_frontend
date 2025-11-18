import { usePageTitle } from 'src/hooks';

import { ProfileView } from 'src/sections/profile/view/profile-view';

// ----------------------------------------------------------------------

export default function ProfilePage() {
  usePageTitle('Profile');
  return <ProfileView />;
}
