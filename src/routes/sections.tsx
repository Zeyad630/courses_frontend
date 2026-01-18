import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard, GuestGuard, RoleGuard } from 'src/components/auth-guard';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const LandingPage = lazy(() => import('src/pages/landing'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
export const CoursesPage = lazy(() => import('src/pages/courses'));
export const MyApplicationsPage = lazy(() => import('src/pages/my-applications'));
export const AdminDashboardPage = lazy(() => import('src/pages/admin/dashboard'));
export const AdminApplicationsPage = lazy(() => import('src/pages/admin/applications'));
export const AdminCoursesPage = lazy(() => import('src/pages/admin/courses'));
export const AdminUsersPage = lazy(() => import('src/pages/admin/users'));
export const AdminReportsPage = lazy(() => import('src/pages/admin/reports'));
export const InstructorCoursesPage = lazy(() => import('src/pages/instructor/courses'));
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
    index: true,
    element: (
      <Suspense fallback={renderFallback()}>
        <LandingPage />
      </Suspense>
    ),
  },
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'my-applications', element: <MyApplicationsPage /> },
      {
        path: 'admin/dashboard',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminDashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/applications',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminApplicationsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/courses',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminCoursesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminUsersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/reports',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'instructor/courses',
        element: (
          <RoleGuard roles={['instructor']}>
            <InstructorCoursesPage />
          </RoleGuard>
        ),
      },
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
      <GuestGuard>
        <AuthLayout>
          <Suspense fallback={renderFallback()}>
            <SignInPage />
          </Suspense>
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <GuestGuard>
        <AuthLayout>
          <Suspense fallback={renderFallback()}>
            <SignUpPage />
          </Suspense>
        </AuthLayout>
      </GuestGuard>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <AuthLayout>
        <Suspense fallback={renderFallback()}>
          <ForgotPasswordPage />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: 'reset-password',
    element: (
      <AuthLayout>
        <Suspense fallback={renderFallback()}>
          <ResetPasswordPage />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: (
      <Suspense fallback={renderFallback()}>
        <Page404 />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={renderFallback()}>
        <Page404 />
      </Suspense>
    ),
  },
];
