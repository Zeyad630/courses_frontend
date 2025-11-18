import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/components/auth-guard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const CoursesPage = lazy(() => import('src/pages/courses'));
export const MyApplicationsPage = lazy(() => import('src/pages/my-applications'));
export const AdminDashboardPage = lazy(() => import('src/pages/admin/dashboard'));
export const AdminApplicationsPage = lazy(() => import('src/pages/admin/applications'));
export const CourseRoomPage = lazy(() => import('src/pages/course-room/course-room'));
export const PaymentPage = lazy(() => import('src/pages/payment/payment'));
export const NotificationsPage = lazy(() => import('src/pages/notifications'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const MyCoursesPage = lazy(() => import('src/pages/my-courses'));
export const PlaygroundPage = lazy(() => import('src/pages/playground'));
export const AssignmentsPage = lazy(() => import('src/pages/assignments'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'my-applications', element: <MyApplicationsPage /> },
      { path: 'admin/dashboard', element: <AdminDashboardPage /> },
      { path: 'admin/applications', element: <AdminApplicationsPage /> },
      { path: 'course-room/:id', element: <CourseRoomPage /> },
      { path: 'payment/:applicationId', element: <PaymentPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'my-courses', element: <MyCoursesPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'assignments', element: <AssignmentsPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
