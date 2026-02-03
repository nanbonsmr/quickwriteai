import { motion } from 'framer-motion';
import { Sparkles, Zap, Star, PenTool, FileText, MessageSquare, Mail, Hash } from 'lucide-react';

const floatingIcons = [
  { Icon: Sparkles, color: 'from-violet-500 to-purple-600', delay: 0, x: '5%', y: '15%' },
  { Icon: Zap, color: 'from-yellow-400 to-orange-500', delay: 0.2, x: '85%', y: '20%' },
  { Icon: Star, color: 'from-pink-500 to-rose-500', delay: 0.4, x: '10%', y: '70%' },
  { Icon: PenTool, color: 'from-blue-500 to-cyan-500', delay: 0.6, x: '90%', y: '65%' },
  { Icon: FileText, color: 'from-emerald-500 to-green-500', delay: 0.8, x: '15%', y: '45%' },
  { Icon: MessageSquare, color: 'from-indigo-500 to-blue-500', delay: 1.0, x: '80%', y: '40%' },
  { Icon: Mail, color: 'from-rose-400 to-pink-500', delay: 1.2, x: '25%', y: '85%' },
  { Icon: Hash, color: 'from-amber-400 to-yellow-500', delay: 1.4, x: '75%', y: '80%' },
];

const floatingVariants = {
  animate: (i: number) => ({
    y: [0, -20, 0],
    x: [0, 10, 0],
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
  { size: 300, x: '20%', y: '30%', color: 'hsl(262, 83%, 58%)', delay: 0 },
  { size: 400, x: '70%', y: '50%', color: 'hsl(213, 100%, 64%)', delay: 1 },
  { size: 250, x: '50%', y: '70%', color: 'hsl(262, 100%, 75%)', delay: 2 },
];

export function HeroAnimatedElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Glow Orbs */}
      {glowOrbs.map((orb, index) => (
        <motion.div
          key={`orb-${index}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
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
      ))}

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
        <motion.div
          key={`icon-${index}`}
          className="absolute hidden md:block"
          style={{ left: x, top: y }}
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
      ))}

      {/* Animated Lines/Connections */}
      <svg className="absolute inset-0 w-full h-full hidden lg:block" style={{ opacity: 0.1 }}>
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
      </svg>

      {/* Sparkle Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
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
      ))}
    </div>
  );
}
