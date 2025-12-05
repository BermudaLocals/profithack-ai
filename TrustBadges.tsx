import { Shield, Lock, CheckCircle, Globe, Zap, Award } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    { icon: Shield, text: 'Bank-Level Security', color: 'text-green-400' },
    { icon: Lock, text: 'Encrypted Payments', color: 'text-blue-400' },
    { icon: CheckCircle, text: 'Verified Platform', color: 'text-purple-400' },
    { icon: Globe, text: 'Global Payments', color: 'text-cyan-400' },
    { icon: Zap, text: 'Instant Payouts', color: 'text-yellow-400' },
    { icon: Award, text: 'Bermuda Registered', color: 'text-pink-400' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-full px-4 py-2 hover:border-gray-700 transition-colors"
        >
          <badge.icon className={`w-4 h-4 ${badge.color}`} />
          <span className="text-sm text-gray-300">{badge.text}</span>
        </div>
      ))}
    </div>
  );
}
