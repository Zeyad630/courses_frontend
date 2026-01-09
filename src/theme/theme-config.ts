import type { CommonColors } from '@mui/material/styles';

import type { ThemeCssVariables } from './types';
import type { PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'DM Sans Variable',
    secondary: 'Barlow',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: '#FEE2E2',
      light: '#FCA5A5',
      main: '#DC2626',
      dark: '#991B1B',
      darker: '#7F1D1D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#F3F4F6',
      light: '#D1D5DB',
      main: '#6B7280',
      dark: '#374151',
      darker: '#111827',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#F3F4F6',
      light: '#D1D5DB',
      main: '#6B7280',
      dark: '#374151',
      darker: '#111827',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#F3F4F6',
      light: '#D1D5DB',
      main: '#6B7280',
      dark: '#374151',
      darker: '#111827',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#F3F4F6',
      light: '#D1D5DB',
      main: '#6B7280',
      dark: '#374151',
      darker: '#111827',
      contrastText: '#FFFFFF',
    },
    error: {
      lighter: '#FEE2E2',
      light: '#FCA5A5',
      main: '#DC2626',
      dark: '#991B1B',
      darker: '#7F1D1D',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FAFAFA',
      '100': '#F5F5F5',
      '200': '#E5E5E5',
      '300': '#D4D4D4',
      '400': '#A3A3A3',
      '500': '#737373',
      '600': '#525252',
      '700': '#404040',
      '800': '#262626',
      '900': '#171717',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
