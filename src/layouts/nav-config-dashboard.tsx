import type { UserRole } from 'src/types/user';

import { Iconly } from 'src/components/iconly';

// ----------------------------------------------------------------------

const icon = (name: string) => <Iconly name={name} size={24} />;

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
    path: '/dashboard',
    icon: icon('Home'),
  },
  // {
  //   title: 'Courses',
  //   path: '/courses',
  //   icon: icon('Bookmark'),
  // },
  // {
  //   title: 'Code Playground',
  //   path: '/playground',
  //   icon: icon('Game'),
  // },
  // {
  //   title: 'Assignments',
  //   path: '/assignments',
  //   icon: icon('Paper'),
  // },
];

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    title: 'Review Applications',
    path: '/admin/applications',
    icon: icon('Document'),
    roles: ['admin'],
  },
  {
    title: 'Users Management',
    path: '/admin/users',
    icon: icon('3 User'),
    roles: ['admin'],
  },
  {
    title: 'Course Management',
    path: '/admin/courses',
    icon: icon('Edit Square'),
    roles: ['admin'],
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: icon('Chart'),
    roles: ['admin'],
  },
];

// Instructor-specific navigation items
const instructorNavItems: NavItem[] = [
  {
    title: 'My Courses',
    path: '/instructor/courses',
    icon: icon('Work'),
    roles: ['instructor'],
  },
  {
    title: 'Students',
    path: '/instructor/students',
    icon: icon('2 User'),
    roles: ['instructor'],
  },
  {
    title: 'Assignments',
    path: '/instructor/assignments',
    icon: icon('Tick Square'),
    roles: ['instructor'],
  },
];

// Student-specific navigation items
const studentNavItems: NavItem[] = [
  {
    title: 'Courses',
    path: '/courses',
    icon: icon('Bookmark'),
    roles: ['student'],
  },
  {
    title: 'My Courses',
    path: '/my-courses',
    icon: icon('Bookmark'),
    roles: ['student'],
  },
  // {
  //   title: 'Assignments',
  //   path: '/assignments',
  //   icon: icon('Document'),
  //   roles: ['student'],
  // },
  {
    title: "Playground",
    path: '/playground',
    icon: icon('Game'),
    roles: ['student'],
  },
  {
    title: 'My Applications',
    path: '/my-applications',
    icon: icon('Folder'),
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
