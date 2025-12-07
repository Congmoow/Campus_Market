import React, { memo, useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

/**
 * 性能优化的 Lottie 动画组件
 * - 使用 memo 避免不必要的重渲染
 * - 使用 Intersection Observer 仅在可见时播放
 * - 优化渲染设置
 */
const LazyLottie = memo(({ 
  animationData, 
  loop = true, 
  autoplay = true,
  style,
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const lottieRef = useRef(null);

  // Intersection Observer - 仅在可见时播放动画
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // 控制动画播放/暂停
        if (lottieRef.current) {
          if (entry.isIntersecting) {
            lottieRef.current.play();
          } else {
            lottieRef.current.pause();
          }
        }
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={isVisible && autoplay}
        style={style}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
          progressiveLoad: true,
          hideOnTransparent: true,
        }}
        {...props}
      />
    </div>
  );
});

LazyLottie.displayName = 'LazyLottie';

export default LazyLottie;
