import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import dashboardPreview from '@/assets/dashboard-preview.png';

export function HeroPreview() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Mouse position with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation
  const springConfig = { damping: 30, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  // Transform mouse position to rotation and translation
  const rotateX = useTransform(smoothMouseY, [-1, 1], [5, -5]);
  const rotateY = useTransform(smoothMouseX, [-1, 1], [-5, 5]);
  const translateX = useTransform(smoothMouseX, [-1, 1], [-10, 10]);
  const translateY = useTransform(smoothMouseY, [-1, 1], [-10, 10]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const normalizedX = (clientX / innerWidth - 0.5) * 2;
      const normalizedY = (clientY / innerHeight - 0.5) * 2;
      
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile, mouseX, mouseY]);

  return (
    <motion.div 
      className="relative drop-shadow-[0_10px_30px_rgba(139,92,246,0.2)] sm:drop-shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          x: isMobile ? 0 : translateX,
          y: isMobile ? 0 : translateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Browser Chrome Frame */}
        <div className="bg-muted/80 backdrop-blur-sm rounded-t-lg sm:rounded-t-xl border border-border/50 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
          {/* URL Bar */}
          <div className="flex-1 bg-background/50 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
            peakdraft.app/dashboard
          </div>
        </div>
        {/* Browser Content */}
        <div className="bg-background/30 backdrop-blur-sm rounded-b-lg sm:rounded-b-xl border border-t-0 border-border/50 overflow-hidden">
          <motion.img 
            src={dashboardPreview} 
            alt="PeakDraft Dashboard - Create blog posts, social media content, emails and ad copy with AI"
            className="w-full h-auto object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>
      
      {/* Glowing ring around preview */}
      <motion.div
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-primary-glow to-primary opacity-20 blur-xl -z-10"
        animate={{ 
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
