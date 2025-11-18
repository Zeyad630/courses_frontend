import { useParams } from 'react-router-dom';

import { usePageTitle } from 'src/hooks';

import { CourseRoomView } from 'src/sections/course-room/view/course-room-view';

// ----------------------------------------------------------------------

export default function CourseRoomPage() {
  const { id } = useParams();
  usePageTitle('Course Room');
  
  return <CourseRoomView courseId={id || ''} />;
}
