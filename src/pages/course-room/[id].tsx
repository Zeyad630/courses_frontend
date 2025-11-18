import { useParams } from 'react-router-dom';

import { CourseRoomView } from 'src/sections/course-room/view/course-room-view';

// ----------------------------------------------------------------------

export default function CourseRoomPage() {
  const { id } = useParams();
  
  return <CourseRoomView courseId={id || ''} />;
}
