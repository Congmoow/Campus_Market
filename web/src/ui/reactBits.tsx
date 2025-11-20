import React from 'react';
import { ReactBits } from 'react-bits/es/ReactBits';

const BaseView = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...rest }, ref) => (
    <div ref={ref} style={{ ...style }} {...rest} />
  )
);

const BaseText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ style, ...rest }, ref) => <span ref={ref} style={{ ...style }} {...rest} />
);

const BaseImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>((props, ref) => (
  <img ref={ref} style={{ display: 'block', borderRadius: 'inherit', ...props.style }} {...props} />
));

const BaseTouchable = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ style, ...rest }, ref) => (
    <button
      ref={ref}
      style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', ...style }}
      {...rest}
    />
  )
);

type AnimatedViewProps = React.HTMLAttributes<HTMLDivElement> & { hoverScale?: number };

const AnimatedView = React.forwardRef<HTMLDivElement, AnimatedViewProps>(({ hoverScale = 1.04, style, ...rest }, ref) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={(e) => {
        setHovered(true);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        rest.onMouseLeave?.(e);
      }}
      style={{
        transition: 'transform 420ms cubic-bezier(0.19, 1, 0.22, 1), box-shadow 420ms ease',
        transform: hovered ? `scale(${hoverScale}) translateY(-4px)` : 'scale(1)',
        boxShadow: hovered ? '0 25px 45px rgba(30, 41, 59, 0.25)' : '0 15px 35px rgba(15, 23, 42, 0.12)',
        ...style,
      }}
      {...rest}
    />
  );
});

const Animated = { View: AnimatedView };

const Dimensions = {
  get: () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }),
};

const PixelRatio = {
  get: () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
};

const Platform = {
  OS: 'web',
  Version: typeof navigator !== 'undefined' ? parseFloat(navigator.appVersion) || 1 : 1,
};

const Easing = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  linear: (t: number) => t,
};

ReactBits.inject({
  Platform,
  PixelRatio,
  Dimensions,
  View: BaseView,
  Text: BaseText,
  Image: BaseImage,
  Touchable: BaseTouchable,
  Animated,
  Easing,
});

const BitsView = ReactBits.View as typeof BaseView;
const BitsText = ReactBits.Text as typeof BaseText;
const BitsImage = ReactBits.Image as typeof BaseImage;
const BitsTouchable = ReactBits.Touchable as typeof BaseTouchable;
const BitsAnimated = ReactBits.Animated as typeof Animated;

export { BitsView, BitsText, BitsImage, BitsTouchable, BitsAnimated };
