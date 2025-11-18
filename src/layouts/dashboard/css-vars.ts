import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme, isNavCollapsed?: boolean) {
  return {
    '--layout-transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--layout-transition-duration': '300ms',
    '--layout-nav-vertical-width': isNavCollapsed ? '80px' : '300px',
    '--layout-nav-collapsed-width': '80px',
    '--layout-dashboard-content-pt': theme.spacing(1),
    '--layout-dashboard-content-pb': theme.spacing(8),
    '--layout-dashboard-content-px': theme.spacing(5),
  };
}
