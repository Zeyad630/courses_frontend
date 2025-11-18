import { useEffect } from 'react';

/**
 * Hook to update the page title
 * @param title - The title to set
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | School Learning Platform`;
  }, [title]);
}
