import { Iconly } from 'src/components/iconly';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: <Iconly name="Home" size={22} />,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <Iconly name="Profile" size={22} />,
  },
  {
    label: 'Settings',
    href: '#',
    icon: <Iconly name="Setting" size={22} />,
  },
];
