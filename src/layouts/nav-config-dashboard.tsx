import type { UserRole } from 'src/types/user';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

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
    icon: icon('ic-analytics'),
  },
  {
    title: 'Courses',
    path: '/courses',
    icon: icon('ic-cart'),
  },
  // {
  //   title: 'Notifications',
  //   path: '/notifications',
  //   icon: icon('ic-blog'),
  // },
  // {
  //   title: 'Profile',
  //   path: '/profile',
  //   icon: icon('ic-user'),
  // },
  {
    title: 'Code Playground',
    path: '/playground',
    icon: icon('ic-blog'),
  },
  {
    title: 'Assignments',
    path: '/assignments',
    icon: icon('ic-cart'),
  },
];

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  // {
  //   title: 'Admin Dashboard',
  //   path: '/admin/dashboard',
  //   icon: icon('ic-analytics'),
  //   roles: ['admin'],
  // },
  {
    title: 'Review Applications',
    path: '/admin/applications',
    icon: icon('ic-cart'),
    roles: ['admin'],
  },
  {
    title: 'Users Management',
    path: '/admin/users',
    icon: icon('ic-user'),
    roles: ['admin'],
  },
  {
    title: 'Course Management',
    path: '/admin/courses',
    icon: icon('ic-blog'),
    roles: ['admin'],
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: icon('ic-analytics'),
    roles: ['admin'],
  },
];

// Instructor-specific navigation items
const instructorNavItems: NavItem[] = [
  {
    title: 'My Courses',
    path: '/instructor/courses',
    icon: icon('ic-blog'),
    roles: ['instructor'],
  },
  {
    title: 'Students',
    path: '/instructor/students',
    icon: icon('ic-user'),
    roles: ['instructor'],
  },
  {
    title: 'Assignments',
    path: '/instructor/assignments',
    icon: icon('ic-cart'),
    roles: ['instructor'],
  },
];

// Student-specific navigation items
const studentNavItems: NavItem[] = [
  {
    title: 'My Courses',
    path: '/my-courses',
    icon: icon('ic-cart'),
    roles: ['student'],
  },
  {
    title: 'My Applications',
    path: '/my-applications',
    icon: icon('ic-blog'),
    roles: ['student'],
  },
  // {
  //   title: 'Assignments',
  //   path: '/student/assignments',
  //   icon: icon('ic-cart'),
  //   roles: ['student'],
  // },
  // {
  //   title: 'Grades',
  //   path: '/student/grades',
  //   icon: icon('ic-analytics'),
  //   roles: ['student'],
  // },
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
