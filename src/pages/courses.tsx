import { usePageTitle } from 'src/hooks';

import { CoursesListView } from 'src/sections/courses/courses-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  usePageTitle('Courses');
  return <CoursesListView />;
}
