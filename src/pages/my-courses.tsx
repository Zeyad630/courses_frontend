import { usePageTitle } from 'src/hooks';

import { MyCoursesView } from 'src/sections/my-courses/view/my-courses-view';

// ----------------------------------------------------------------------

export default function MyCoursesPage() {
  usePageTitle('My Courses');
  return <MyCoursesView />;
}
