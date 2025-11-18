import { usePageTitle } from 'src/hooks';

import { CoursesView } from 'src/sections/courses/view/courses-view';

// ----------------------------------------------------------------------

export default function Page() {
  usePageTitle('Courses');
  return <CoursesView />;
}
