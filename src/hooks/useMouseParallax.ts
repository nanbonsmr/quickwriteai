import { useState, useEffect, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface ParallaxValues {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

export function useMouseParallax(intensity: number = 1) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [parallax, setParallax] = useState<ParallaxValues>({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize mouse position to -1 to 1
    const normalizedX = (clientX / innerWidth - 0.5) * 2;
    const normalizedY = (clientY / innerHeight - 0.5) * 2;
    
    setMousePosition({ x: normalizedX, y: normalizedY });
    
    // Calculate parallax values with intensity
    setParallax({
      x: normalizedX * 20 * intensity,
      y: normalizedY * 20 * intensity,
      rotateX: normalizedY * 5 * intensity,
      rotateY: -normalizedX * 5 * intensity,
    });
  }, [intensity]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return { mousePosition, parallax };
}
