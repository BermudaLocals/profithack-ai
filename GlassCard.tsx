import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative group ${className}`}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
      
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500 blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {children}
      </div>
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-20 blur" />
      </div>
    </motion.div>
  );
}
