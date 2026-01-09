import { useTranslation } from 'react-i18next';

import { usePageTitle } from 'src/hooks';

import { InstructorCoursesView } from 'src/sections/instructor/view';

// ----------------------------------------------------------------------

export default function InstructorCoursesPage() {
  const { t } = useTranslation();

  usePageTitle(t('courses.courseRounds'));

  return <InstructorCoursesView />;
}
