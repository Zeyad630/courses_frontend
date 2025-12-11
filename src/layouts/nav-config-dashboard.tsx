import type { UserRole } from 'src/types/user';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconify icon={name} width={24} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: UserRole[];
};

// Common navigation items for all users
const commonNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('solar:home-2-bold-duotone'),
  },
  {
    title: 'Courses',
    path: '/courses',
    icon: icon('solar:book-bookmark-bold-duotone'),
  },
  {
    title: 'Code Playground',
    path: '/playground',
    icon: icon('solar:code-bold-duotone'),
  },
  {
    title: 'Assignments',
    path: '/assignments',
    icon: icon('solar:clipboard-list-bold-duotone'),
  },
];

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    title: 'Review Applications',
    path: '/admin/applications',
    icon: icon('solar:file-check-bold-duotone'),
    roles: ['admin'],
  },
  {
    title: 'Users Management',
    path: '/admin/users',
    icon: icon('solar:users-group-rounded-bold-duotone'),
    roles: ['admin'],
  },
  {
    title: 'Course Management',
    path: '/admin/courses',
    icon: icon('solar:notebook-bold-duotone'),
    roles: ['admin'],
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: icon('solar:chart-square-bold-duotone'),
    roles: ['admin'],
  },
];

// Instructor-specific navigation items
const instructorNavItems: NavItem[] = [
  {
    title: 'My Courses',
    path: '/instructor/courses',
    icon: icon('solar:presentation-graph-bold-duotone'),
    roles: ['instructor'],
  },
  {
    title: 'Students',
    path: '/instructor/students',
    icon: icon('solar:users-group-two-rounded-bold-duotone'),
    roles: ['instructor'],
  },
  {
    title: 'Assignments',
    path: '/instructor/assignments',
    icon: icon('solar:clipboard-check-bold-duotone'),
    roles: ['instructor'],
  },
];

// Student-specific navigation items
const studentNavItems: NavItem[] = [
  {
    title: 'My Courses',
    path: '/my-courses',
    icon: icon('solar:book-2-bold-duotone'),
    roles: ['student'],
  },
  {
    title: 'My Applications',
    path: '/my-applications',
    icon: icon('solar:folder-with-files-bold-duotone'),
    roles: ['student'],
  },
];

export const getNavData = (userRole?: UserRole): NavItem[] => {
  let roleSpecificItems: NavItem[] = [];
  
  switch (userRole) {
    case 'admin':
      roleSpecificItems = adminNavItems;
      break;
    case 'instructor':
      roleSpecificItems = instructorNavItems;
      break;
    case 'student':
      roleSpecificItems = studentNavItems;
      break;
    default:
      roleSpecificItems = [];
  }

  return [...commonNavItems, ...roleSpecificItems];
};

// Default navigation for when user is not authenticated
export const navData = commonNavItems;
