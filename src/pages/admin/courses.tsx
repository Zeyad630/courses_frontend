import { usePageTitle } from 'src/hooks';

import { AdminCourseManagementView } from 'src/sections/admin/view/admin-course-management-view';

// ----------------------------------------------------------------------

export default function AdminCoursesPage() {
  usePageTitle('Course Management');
  return <AdminCourseManagementView />;
}
