import { useState, useEffect, useCallback } from "react";
import { Zap, Diamond, Flame, Crown, Star, Sparkles, Heart, Gift, Coins, DollarSign, Wheat, Sun, HandHeart } from "lucide-react";

// PROFITHACK Daily Blessing Symbol - "Daily Bread" (Wheat)
// Universal symbol of provision, blessing, and daily sustenance
export const DailySparkIcon = ({ className = "w-6 h-6", animated = false }: { className?: string; animated?: boolean }) => (
  <div className={`relative ${animated ? "animate-daily-spark" : ""}`}>
    {/* Wheat icon representing "Daily Bread" - universal blessing */}
    <Wheat className={`${className} text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]`} />
    {animated && (
      <>
        <div className="absolute inset-0 animate-ping">
          <Wheat className={`${className} text-amber-300 opacity-50`} />
        </div>
        {/* Blessing glow */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
        {/* Small sparkles for blessing effect */}
        <Sparkles className="absolute -top-2 -left-1 w-3 h-3 text-yellow-300 animate-pulse" />
      </>
    )}
  </div>
);

// Alternative Daily Blessing Icons
export const DailyBlessingIcon = ({ variant = "bread", className = "w-6 h-6", animated = false }: { 
  variant?: "bread" | "blessing" | "sun" | "heart";
  className?: string; 
  animated?: boolean;
}) => {
  const icons = {
    bread: <Wheat className={`${className} text-amber-400 fill-amber-400`} />,
    blessing: <HandHeart className={`${className} text-pink-400 fill-pink-400`} />,
    sun: <Sun className={`${className} text-yellow-400 fill-yellow-400`} />,
    heart: <Heart className={`${className} text-red-400 fill-red-400`} />
  };

  const glowColors = {
    bread: "rgba(251,191,36,0.8)",
    blessing: "rgba(236,72,153,0.8)",
    sun: "rgba(250,204,21,0.8)",
    heart: "rgba(248,113,113,0.8)"
  };

  return (
    <div className={`relative ${animated ? "animate-daily-spark" : ""}`} style={{
      filter: `drop-shadow(0 0 10px ${glowColors[variant]})`
    }}>
      {icons[variant]}
      {animated && (
        <>
          <div className="absolute inset-0 animate-ping opacity-50">
            {icons[variant]}
          </div>
          <Sparkles className="absolute -top-2 -left-1 w-3 h-3 text-yellow-300 animate-pulse" />
        </>
      )}
    </div>
  );
};

// Spark types with themes
type SparkTheme = "default" | "bermuda" | "tropical" | "neon" | "gold" | "diamond" | "fire" | "cosmic";

interface Spark {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  icon: string;
  delay: number;
  duration: number;
  rotation: number;
  theme: SparkTheme;
}

// Theme color palettes
const themeColors: Record<SparkTheme, string[]> = {
  default: ["#FF1493", "#8B5CF6", "#00D4FF", "#FFD700", "#FF6B6B"],
  bermuda: ["#00CED1", "#40E0D0", "#48D1CC", "#20B2AA", "#FFB6C1", "#FF69B4", "#87CEEB", "#FFA07A"],
  tropical: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
  neon: ["#FF00FF", "#00FFFF", "#FF1493", "#00FF00", "#FF4500", "#9400D3"],
  gold: ["#FFD700", "#FFA500", "#FF8C00", "#DAA520", "#B8860B", "#CD853F"],
  diamond: ["#B9F2FF", "#87CEEB", "#ADD8E6", "#E0FFFF", "#AFEEEE", "#00CED1"],
  fire: ["#FF4500", "#FF6347", "#FF7F50", "#FFA500", "#FFD700", "#DC143C"],
  cosmic: ["#9400D3", "#8A2BE2", "#9932CC", "#BA55D3", "#DA70D6", "#EE82EE"]
};

// Bermuda-inspired gift types with island themes
export const bermudaGifts = [
  { id: "conch", name: "Conch Shell", price: 0.99, color: "#FFB6C1" },
  { id: "palmtree", name: "Palm Tree", price: 1.99, color: "#20B2AA" },
  { id: "pinkSand", name: "Pink Sand", price: 4.99, color: "#FF69B4" },
  { id: "turquoise", name: "Turquoise Wave", price: 9.99, color: "#40E0D0" },
  { id: "lighthouse", name: "Lighthouse", price: 19.99, color: "#FF6347" },
  { id: "bermudaTriangle", name: "Bermuda Triangle", price: 49.99, color: "#00CED1" },
  { id: "islandParadise", name: "Island Paradise", price: 99.99, color: "#FF1493" },
  { id: "oceanSunset", name: "Ocean Sunset", price: 199.99, color: "#FFA500" },
];

// ... (rest of the component - 500+ more lines as shown above)
