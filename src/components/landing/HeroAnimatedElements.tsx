import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Zap, Star, PenTool, FileText, MessageSquare, Mail, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';

const floatingIcons = [
  { Icon: Sparkles, color: 'from-violet-500 to-purple-600', delay: 0, x: '5%', y: '15%', depth: 0.8 },
  { Icon: Zap, color: 'from-yellow-400 to-orange-500', delay: 0.2, x: '85%', y: '20%', depth: 1.2 },
  { Icon: Star, color: 'from-pink-500 to-rose-500', delay: 0.4, x: '10%', y: '70%', depth: 0.6 },
  { Icon: PenTool, color: 'from-blue-500 to-cyan-500', delay: 0.6, x: '90%', y: '65%', depth: 1.0 },
  { Icon: FileText, color: 'from-emerald-500 to-green-500', delay: 0.8, x: '15%', y: '45%', depth: 1.4 },
  { Icon: MessageSquare, color: 'from-indigo-500 to-blue-500', delay: 1.0, x: '80%', y: '40%', depth: 0.7 },
  { Icon: Mail, color: 'from-rose-400 to-pink-500', delay: 1.2, x: '25%', y: '85%', depth: 1.1 },
  { Icon: Hash, color: 'from-amber-400 to-yellow-500', delay: 1.4, x: '75%', y: '80%', depth: 0.9 },
];

const floatingVariants = {
  animate: (i: number) => ({
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4 + i * 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.2,
    },
  }),
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const glowOrbs = [
  { size: 300, x: '20%', y: '30%', color: 'hsl(262, 83%, 58%)', delay: 0, depth: 0.5 },
  { size: 400, x: '70%', y: '50%', color: 'hsl(213, 100%, 64%)', delay: 1, depth: 0.8 },
  { size: 250, x: '50%', y: '70%', color: 'hsl(262, 100%, 75%)', delay: 2, depth: 0.3 },
];

export function HeroAnimatedElements() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Mouse position with spring physics for smooth following
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animation for mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize to -1 to 1 range
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Glow Orbs with Mouse Parallax */}
      {glowOrbs.map((orb, index) => {
        const orbX = useTransform(smoothMouseX, [-1, 1], [-30 * orb.depth, 30 * orb.depth]);
        const orbY = useTransform(smoothMouseY, [-1, 1], [-30 * orb.depth, 30 * orb.depth]);

        return (
          <motion.div
            key={`orb-${index}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              x: isMobile ? 0 : orbX,
              y: isMobile ? 0 : orbY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: orb.delay,
            }}
          />
        );
      })}

      {/* Floating Icons with Mouse Parallax */}
      {floatingIcons.map(({ Icon, color, delay, x, y, depth }, index) => {
        const iconX = useTransform(smoothMouseX, [-1, 1], [-25 * depth, 25 * depth]);
        const iconY = useTransform(smoothMouseY, [-1, 1], [-25 * depth, 25 * depth]);
        const iconRotate = useTransform(smoothMouseX, [-1, 1], [-5 * depth, 5 * depth]);

        return (
          <motion.div
            key={`icon-${index}`}
            className="absolute hidden md:block"
            style={{ 
              left: x, 
              top: y,
              x: iconX,
              y: iconY,
              rotate: iconRotate,
            }}
            custom={index}
            variants={floatingVariants}
            animate="animate"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 0.5 }}
          >
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg backdrop-blur-sm`}
              style={{ 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Animated Lines/Connections with Mouse Parallax */}
      <motion.svg 
        className="absolute inset-0 w-full h-full hidden lg:block" 
        style={{ 
          opacity: 0.1,
          x: useTransform(smoothMouseX, [-1, 1], [-10, 10]),
          y: useTransform(smoothMouseY, [-1, 1], [-10, 10]),
        }}
      >
        <motion.path
          d="M100,200 Q400,100 700,300 T1200,200"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M50,400 Q300,250 600,350 T1100,300"
          fill="none"
          stroke="url(#gradient2)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: 'easeInOut', delay: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
            <stop offset="100%" stopColor="hsl(213, 100%, 64%)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(213, 100%, 64%)" />
            <stop offset="100%" stopColor="hsl(262, 100%, 75%)" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Sparkle Particles with subtle mouse influence */}
      {[...Array(15)].map((_, i) => {
        const particleX = useTransform(smoothMouseX, [-1, 1], [-5, 5]);
        const particleY = useTransform(smoothMouseY, [-1, 1], [-5, 5]);
        
        return (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              x: isMobile ? 0 : particleX,
              y: isMobile ? 0 : particleY,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}
