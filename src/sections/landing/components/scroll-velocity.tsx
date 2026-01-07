import type { Theme, SxProps } from '@mui/material/styles';

import React, { useRef, useState, useLayoutEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useVelocity,
  useTransform,
  useMotionValue,
  useAnimationFrame,
} from 'motion/react';

import Box from '@mui/material/Box';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  parallaxSx?: SxProps<Theme>;
  scrollerSx?: SxProps<Theme>;
}

export interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: string[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  parallaxSx?: SxProps<Theme>;
  scrollerSx?: SxProps<Theme>;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = '',
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  parallaxSx,
  scrollerSx,
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};

  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: damping ?? 50,
    stiffness: stiffness ?? 400,
  });

  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping?.input || [0, 1000],
    velocityMapping?.output || [0, 5],
    { clamp: false }
  );

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const copies = Array.from({ length: numCopies ?? 6 });

  return (
    <Box
      className={parallaxClassName}
      style={parallaxStyle}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          width: 1,
        },
        ...(Array.isArray(parallaxSx) ? parallaxSx : [parallaxSx]),
      ]}
    >
      <Box
        component={motion.div}
        className={scrollerClassName}
        style={{ x, ...scrollerStyle }}
        sx={[
          {
            display: 'flex',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            willChange: 'transform',
          },
          ...(Array.isArray(scrollerSx) ? scrollerSx : [scrollerSx]),
        ]}
      >
        {copies.map((_, i) => (
          <Box
            key={i}
            component="span"
            ref={i === 0 ? copyRef : undefined}
            className={className}
            sx={{ flexShrink: 0 }}
          >
            {children}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function ScrollVelocity({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  parallaxSx,
  scrollerSx,
}: ScrollVelocityProps) {
  return (
    <Box component="section">
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
          parallaxSx={parallaxSx}
          scrollerSx={scrollerSx}
        >
          {text}&nbsp;
        </VelocityText>
      ))}
    </Box>
  );
}

export default ScrollVelocity;
