import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles } from 'lucide-react';
import founderBadgeLogo from '/founder-badge.png';

interface FounderBadgeProps {
  username?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export function FounderBadge({ 
  username, 
  size = 'medium', 
  showIcon = true,
  className = '' 
}: FounderBadgeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-6 px-2 text-xs';
      case 'large':
        return 'h-10 px-4 text-base';
      default:
        return 'h-8 px-3 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-3 h-3';
      case 'large':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge 
        className={`
          ${getSizeClasses()}
          bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600
          text-white font-bold
          border-2 border-yellow-400
          shadow-lg shadow-yellow-500/50
          hover:shadow-xl hover:shadow-yellow-500/70
          transition-all duration-300
          animate-pulse
          relative overflow-hidden
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        
        <div className="relative flex items-center gap-1.5">
          {showIcon && (
            <div className="relative">
              <Crown className={`${getIconSize()} animate-bounce`} />
              <Sparkles className={`absolute -top-0.5 -right-0.5 ${size === 'small' ? 'w-2 h-2' : 'w-2.5 h-2.5'} text-yellow-200 animate-ping`} />
            </div>
          )}
          <span className="font-extrabold tracking-wide uppercase">FOUNDER</span>
        </div>
      </Badge>
      
      {username && (
        <span className="text-sm text-muted-foreground font-medium">
          {username}
        </span>
      )}
    </div>
  );
}

interface FounderCardProps {
  username: string;
  email: string;
  joinDate: string;
  className?: string;
}

export function FounderCard({ username, email, joinDate, className = '' }: FounderCardProps) {
  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-yellow-900/20
      border-2 border-yellow-500/50
      rounded-xl p-6
      shadow-2xl shadow-yellow-500/20
      ${className}
    `}>
      {/* Background founder logo (neon brain trilogy) */}
      <div className="absolute top-0 right-0 opacity-10 w-32 h-32">
        <img 
          src={founderBadgeLogo} 
          alt="" 
          className="w-full h-full object-contain animate-pulse"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <FounderBadge size="large" showIcon />
          <img 
            src={founderBadgeLogo} 
            alt="Founder Seal - PROFITHACK AI Neon Brain" 
            className="w-12 h-12 rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/50"
          />
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Founder Name</p>
            <p className="text-lg font-bold text-yellow-400">{username}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{email}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-medium">{joinDate}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-yellow-500/20">
          <p className="text-xs text-yellow-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            EXCLUSIVE FOUNDER ACCESS • LIFETIME BENEFITS
          </p>
        </div>
      </div>
    </div>
  );
}
