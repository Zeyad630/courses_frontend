import { usePageTitle } from 'src/hooks';

import { AssignmentDemo } from 'src/sections/playground/view/assignment-demo';

// -----------------------------------------------------------------------

export default function AssignmentsPage() {
  usePageTitle('Assignments');
  return <AssignmentDemo />;
}
