import { CONFIG } from 'src/config-global';

import { LandingView } from 'src/sections/landing';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Home - ${CONFIG.appName}`}</title>

      <LandingView />
    </>
  );
}
