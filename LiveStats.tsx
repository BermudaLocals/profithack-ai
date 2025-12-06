import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Globe, Zap } from 'lucide-react';
import { AdSpace } from './AdSpace';

export function LiveStats() {
  const [stats, setStats] = useState({
    waitlist: 0,
    online: 0,
    countries: 0,
    invitesUsed: 0
  });
  
  const [justIncreased, setJustIncreased] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real waitlist count immediately
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/waitlist/count');
        const data = await res.json();
        const newWaitlist = data.count || 0;
        
        setStats(prev => {
          // Check if waitlist increased
          if (newWaitlist > prev.waitlist) {
            setJustIncreased('waitlist');
            setTimeout(() => setJustIncreased(null), 1000);
          }
          
          return {
            waitlist: newWaitlist,
            online: prev.online,
            countries: prev.countries,
            invitesUsed: prev.invitesUsed
          };
        });
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      }
    };

    // Initial fetch
    fetchStats();

    // Poll for real waitlist updates every 2 seconds
    const waitlistInterval = setInterval(fetchStats, 2000);

    // Update online users with realistic variation every 5 seconds
    const onlineInterval = setInterval(() => {
      setStats(prev => {
        // Simulate realistic online user fluctuations (±10% change)
        const baseOnline = 127;
        const variation = Math.floor(Math.random() * 31) - 15; // -15 to +15
        const newOnline = Math.max(50, baseOnline + variation);
        
        if (newOnline !== prev.online) {
          setJustIncreased('online');
          setTimeout(() => setJustIncreased(null), 1000);
        }
        
        return {
          ...prev,
          online: newOnline,
          countries: 47, // Static for now
          invitesUsed: 1048 + Math.floor(Math.random() * 5) // Slow growth
        };
      });
    }, 5000);

    return () => {
      clearInterval(waitlistInterval);
      clearInterval(onlineInterval);
    };
  }, []);

  const statItems = [
    { label: 'Online Now', value: stats.online, icon: TrendingUp, color: 'from-green-400 to-emerald-600', pulse: true, id: 'onlinenow' },
    { label: 'Countries', value: stats.countries, icon: Globe, color: 'from-cyan-400 to-blue-600', id: 'countries' },
    { label: 'Invites Used', value: stats.invitesUsed, icon: Zap, color: 'from-yellow-400 to-orange-600', id: 'invitesused' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
      {/* Ad Space - replaces waitlist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <AdSpace placement="header" size="small" />
      </motion.div>

      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/10" />
          
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 rounded-xl md:rounded-2xl blur-xl transition-opacity`} />
          
          {/* Content */}
          <div className="relative p-2 md:p-4 text-center">
            <div className="flex justify-center mb-1">
              <div className={`p-1 md:p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-lg`}>
                <item.icon className="w-3 h-3 md:w-5 md:h-5 text-white" />
              </div>
            </div>
            
            <motion.div 
              className="text-lg md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              key={item.value}
              initial={{ scale: 1 }}
              animate={{ 
                scale: justIncreased === item.id 
                  ? [1, 1.15, 1] 
                  : [1, 1.05, 1] 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {item.value.toLocaleString()}
              {item.pulse && (
                <span className="ml-1 inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </motion.div>
            
            <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{item.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
