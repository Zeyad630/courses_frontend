import { useTranslation } from 'react-i18next';

import { usePageTitle } from 'src/hooks';

import { AdminCourseManagementView } from 'src/sections/admin/view/admin-course-management-view';

// ----------------------------------------------------------------------

export default function AdminCoursesPage() {
  const { t } = useTranslation();
  usePageTitle(t('courses.courseManagement'));
  return <AdminCourseManagementView />;
}
