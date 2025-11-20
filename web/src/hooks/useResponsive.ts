import { useState, useEffect } from 'react';

interface Breakpoints {
  xs: boolean;  // < 576px
  sm: boolean;  // >= 576px
  md: boolean;  // >= 768px
  lg: boolean;  // >= 992px
  xl: boolean;  // >= 1200px
  xxl: boolean; // >= 1600px
}

export const useResponsive = (): Breakpoints => {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoints({
        xs: width < 576,
        sm: width >= 576,
        md: width >= 768,
        lg: width >= 992,
        xl: width >= 1200,
        xxl: width >= 1600,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
};

