import { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({ value = 0, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = Number(value) || 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (endValue - startValue) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <span ref={ref}>
      {count.toLocaleString('ar-EG')}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;