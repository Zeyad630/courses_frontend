import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from '../logo/classes';

// ----------------------------------------------------------------------

export type SchoolLogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function SchoolLogo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = false,
  ...other
}: SchoolLogoProps) {
  const logoSrc = isSingle 
    ? '/assets/school/logoss.png' 
    : '/assets/school/logo.png';

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="School Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: isSingle ? 40 : 140,
          height: isSingle ? 40 : 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <img
        src={logoSrc}
        alt="School Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
