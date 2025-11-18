import { useAuth } from 'src/contexts/simple-auth-context';

import { AdminDashboardView } from 'src/sections/admin/view/admin-dashboard-view';
import { StudentDashboardView } from 'src/sections/student/view/student-dashboard-view';
import { InstructorDashboardView } from 'src/sections/instructor/view/instructor-dashboard-view';

// ----------------------------------------------------------------------

export function RoleDashboardView() {
  const { user, hasRole } = useAuth();

  if (hasRole('admin')) {
    return <AdminDashboardView />;
  }

  if (hasRole('instructor')) {
    return <InstructorDashboardView />;
  }

  if (hasRole('student')) {
    return <StudentDashboardView />;
  }

  // Default fallback
  return <StudentDashboardView />;
}
