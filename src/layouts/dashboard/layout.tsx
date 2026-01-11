import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useAuth } from 'src/contexts/simple-auth-context';

import { Iconify } from 'src/components/iconify';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { MainSection } from '../core/main-section';
import { Searchbar } from '../components/searchbar';
import { getNavData } from '../nav-config-dashboard';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';
import { NotificationsPopover } from '../components/notifications-popover';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { user } = useAuth();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const { value: isNavCollapsed, onToggle: onToggleNavCollapse } = useBoolean();

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile 
            data={getNavData(user?.role)} 
            open={open} 
            onClose={onClose} 
          />
          
          {/** @slot Nav collapse button for desktop */}
          <IconButton
            onClick={onToggleNavCollapse}
            sx={{ 
              mr: 1, 
              ml: -1, 
              [theme.breakpoints.down(layoutQuery)]: { display: 'none' } 
            }}
          >
            <Iconify icon={isNavCollapsed ? "uim:align" : "uim:left-indent"} sx={{ width: 24, height: 24 }}/>
          </IconButton>
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Searchbar */}
          {user?.role === 'student' ? null : <Searchbar />}


          {/** @slot Notifications popover */}
          {user?.role === 'student' ? null : <NotificationsPopover sx={{ width: 36, height: 36 }} />}

          {/** @slot Account drawer */}
          <AccountPopover data={_account} sx={{ width: 36, height: 36 }} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={{
          bgcolor: varAlpha(theme.vars.palette.background.defaultChannel, 0.7),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          backgroundImage: `linear-gradient(to bottom, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.4)}, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.2)})`,
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...slotProps?.header?.sx,
        }}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop 
          data={getNavData(user?.role)} 
          layoutQuery={layoutQuery} 
          isCollapsed={isNavCollapsed}
          onToggleCollapse={onToggleNavCollapse}
        />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme, isNavCollapsed), ...cssVars }}
      sx={[
        {
          background: (t) => 
            `radial-gradient(circle at 50% 0%, ${t.palette.primary.lighter} 0%, transparent 50%)`,
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
