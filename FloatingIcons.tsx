import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Zap, Sparkles, Rocket, Code, DollarSign, Star, 
  Heart, TrendingUp, Award, Crown, Gem, Flame 
} from 'lucide-react';

const icons = [
  { Icon: Zap, color: 'from-yellow-400 to-orange-500', delay: 0 },
  { Icon: Sparkles, color: 'from-pink-400 to-purple-500', delay: 0.2 },
  { Icon: Rocket, color: 'from-cyan-400 to-blue-500', delay: 0.4 },
  { Icon: Code, color: 'from-green-400 to-emerald-500', delay: 0.6 },
  { Icon: DollarSign, color: 'from-yellow-300 to-yellow-600', delay: 0.8 },
  { Icon: Star, color: 'from-purple-400 to-pink-500', delay: 1.0 },
  { Icon: Heart, color: 'from-red-400 to-pink-500', delay: 1.2 },
  { Icon: TrendingUp, color: 'from-emerald-400 to-green-500', delay: 1.4 },
  { Icon: Award, color: 'from-orange-400 to-red-500', delay: 1.6 },
  { Icon: Crown, color: 'from-yellow-400 to-amber-600', delay: 1.8 },
  { Icon: Gem, color: 'from-cyan-400 to-purple-500', delay: 2.0 },
  { Icon: Flame, color: 'from-orange-500 to-red-600', delay: 2.2 },
];

export function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-15" style={{ zIndex: -5 }}>
      {icons.map((item, i) => (
        <FloatingIcon 
          key={i} 
          Icon={item.Icon} 
          color={item.color}
          delay={item.delay}
          index={i}
        />
      ))}
    </div>
  );
}

function FloatingIcon({ 
  Icon, 
  color, 
  delay, 
  index 
}: { 
  Icon: any; 
  color: string; 
  delay: number;
  index: number;
}) {
  const positions = [
    { top: '10%', left: '10%' },
    { top: '15%', left: '85%' },
    { top: '30%', left: '20%' },
    { top: '25%', left: '75%' },
    { top: '45%', left: '8%' },
    { top: '50%', left: '90%' },
    { top: '65%', left: '15%' },
    { top: '70%', left: '80%' },
    { top: '85%', left: '25%' },
    { top: '90%', left: '70%' },
    { top: '5%', left: '50%' },
    { top: '95%', left: '50%' },
  ];
  
  const pos = positions[index % positions.length];
  
  return (
    <motion.div
      className="absolute"
      style={pos}
      initial={{ opacity: 0, scale: 0, rotateZ: -180 }}
      animate={{ 
        opacity: [0, 0.4, 0.4, 0],
        scale: [0, 1, 0.9, 0],
        rotateZ: [180, 0, 360],
        y: [0, -30, -60, -90],
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut"
      }}
    >
      <div className={`relative group cursor-pointer`}>
        {/* Glow effect - very subtle */}
        <div className={`absolute inset-0 bg-gradient-to-r ${color} blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full`} />
        
        {/* Icon */}
        <div className={`relative bg-gradient-to-r ${color} p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        
        {/* Particle trail */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${color} rounded-full blur-sm`}
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </div>
    </motion.div>
  );
}
