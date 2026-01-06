import type { SvgColorProps } from 'src/components/svg-color/types';

import { SvgColor } from 'src/components/svg-color';

export type IconlyProps = Omit<SvgColorProps, 'src'> & {
  name: string;
  size?: number;
};

export function Iconly({ name, size = 24, sx, ...other }: IconlyProps) {
  return (
    <SvgColor
      src={`/assets/icons/Iconly/Iconly/Curved/Outline/${name}.svg`}
      sx={[
        {
          width: size,
          height: size,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}
