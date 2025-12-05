import { useEffect, useState } from 'react';
import { Users, Clock } from 'lucide-react';

export function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Calculate time until February 24, 2026 launch
    const targetDate = new Date('2026-02-24T00:00:00');
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft('Feb 24, 2026');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 border border-orange-500/30 rounded-full px-3 py-2 md:px-6 md:py-3 backdrop-blur">
      <div className="flex items-center justify-center gap-2 md:gap-6 text-xs md:text-sm">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
          <span className="text-white whitespace-nowrap">
            <span className="font-bold text-purple-400">2.8k</span> joined
          </span>
        </div>
        
        <div className="w-px h-3 md:h-4 bg-gray-700" />
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 animate-pulse" />
          <span className="text-white whitespace-nowrap">
            Launch: <span className="font-bold text-cyan-400">{timeLeft}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
