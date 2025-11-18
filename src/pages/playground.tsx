import { usePageTitle } from 'src/hooks';

import { CodePlaygroundView } from 'src/sections/playground';

// -----------------------------------------------------------------------

export default function PlaygroundPage() {
  usePageTitle('Code Playground');
  return <CodePlaygroundView />;
}
