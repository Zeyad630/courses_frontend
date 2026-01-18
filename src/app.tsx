import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ThemeProvider } from 'src/theme/theme-provider';
import { CoursesProvider } from 'src/contexts/courses-context';
import { AuthProvider } from 'src/contexts/simple-auth-context';
import { ApplicationsProvider } from 'src/contexts/applications-context';
import { CourseRoundsProvider } from 'src/contexts/course-rounds-context';

import { trackPageView } from './firebase';

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AuthProvider>
        <CoursesProvider>
          <CourseRoundsProvider>
            <ApplicationsProvider>{children}</ApplicationsProvider>
          </CourseRoundsProvider>
        </CoursesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
