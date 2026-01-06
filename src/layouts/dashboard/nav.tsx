import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Scrollbar } from 'src/components/scrollbar';
import { SchoolLogo } from 'src/components/school-logo';

import type { NavItem } from '../nav-config-dashboard';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function NavDesktop({
  sx,
  data,
  slots,
  layoutQuery,
  isCollapsed,
  onToggleCollapse,
  ...other
}: NavContentProps & { 
  layoutQuery: Breakpoint; 
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2,
        px: isCollapsed ? 0.75 : 2,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
        backdropFilter: 'blur(12px)',
        transition: theme.transitions.create(['width', 'padding'], {
          easing: 'var(--layout-transition-easing)',
          duration: 'var(--layout-transition-duration)',
        }),
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent 
        data={data} 
        slots={slots} 
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, sx, isCollapsed }: NavContentProps) {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <SchoolLogo isSingle={isCollapsed} />
      </Box>

      {!isCollapsed && slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.map((item) => {
              const isActived = item.path === pathname;

              const navButton = (
                <ListItemButton
                  disableGutters
                  component={RouterLink}
                  href={item.path}
                  title={isCollapsed ? item.title : undefined}
                  sx={[
                    (currTheme) => ({
                      pl: isCollapsed ? 1 : 2,
                      py: 1.25,
                      gap: isCollapsed ? 0 : 2,
                      pr: isCollapsed ? 1 : 2,
                      borderRadius: 2,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      color: currTheme.vars.palette.text.secondary,
                      minHeight: 46,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      transition: currTheme.transitions.create(
                        ['background-color', 'color', 'transform', 'box-shadow'],
                        {
                          duration: 200,
                        }
                      ),
                      position: 'relative',
                      '&:hover': {
                        bgcolor: varAlpha(currTheme.vars.palette.primary.mainChannel, 0.08),
                        transform: isCollapsed ? 'none' : 'translateX(4px)',
                        '& .nav-icon': {
                          transform: 'scale(1.1)',
                        },
                      },
                      ...(isActived && {
                        fontWeight: 'fontWeightSemiBold',
                        color: currTheme.vars.palette.primary.main,
                        bgcolor: varAlpha(currTheme.vars.palette.primary.mainChannel, 0.08),
                        background: `linear-gradient(90deg, ${varAlpha(currTheme.vars.palette.primary.mainChannel, 0.16)} 0%, ${varAlpha(currTheme.vars.palette.primary.mainChannel, 0.04)} 100%)`,
                        '&:hover': {
                          bgcolor: varAlpha(currTheme.vars.palette.primary.mainChannel, 0.20),
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 24,
                          borderRadius: '0 4px 4px 0',
                          bgcolor: 'primary.main',
                          boxShadow: `0 0 8px ${currTheme.vars.palette.primary.main}`,
                        },
                      }),
                    }),
                  ]}
                >
                  <Box
                    className="nav-icon"
                    component="span"
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.create('transform'),
                    }}
                  >
                    {item.icon}
                  </Box>

                  {!isCollapsed && (
                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>
                  )}

                  {!isCollapsed && item.info && item.info}
                </ListItemButton>
              );

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  {isCollapsed ? (
                    <Tooltip title={item.title} placement="right" arrow>
                      {navButton}
                    </Tooltip>
                  ) : (
                    navButton
                  )}
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {!isCollapsed && slots?.bottomArea}

    </>
  );
}
