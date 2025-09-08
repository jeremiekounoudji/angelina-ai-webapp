'use client'

import { useEffect, useState } from 'react';
import { useInView } from './useInView';

interface UseCounterOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export function useCounter({
  end,
  duration = 2000,
  start = 0,
  decimals = 0,
}: UseCounterOptions) {
  const [count, setCount] = useState(start);
  const { ref, isInView } = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, start, duration, decimals]);

  return { count, ref };
}