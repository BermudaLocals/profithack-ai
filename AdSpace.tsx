import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdSpaceProps {
  placement: 'header' | 'sidebar' | 'feed' | 'footer';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AdSpace({ placement, size = 'medium', className = '' }: AdSpaceProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Google AdSense initialization
    if (typeof window !== 'undefined' && adContainerRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (error) {
        console.error('Ad loading error:', error);
      }
    }
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-24 w-full';
      case 'large':
        return 'h-64 w-full';
      default:
        return 'h-32 w-full';
    }
  };

  const getAdSlot = () => {
    // Different ad slots for different placements
    const slots = {
      header: '1234567890',
      sidebar: '2345678901',
      feed: '3456789012',
      footer: '4567890123',
    };
    return slots[placement];
  };

  return (
    <div className={`relative ${className}`}>
      <Badge variant="secondary" className="absolute top-2 right-2 z-10 text-xs opacity-60">
        Ad
      </Badge>
      
      {/* Google AdSense */}
      <div ref={adContainerRef} className={getSizeClasses()}>
        <ins
          className="adsbygoogle block w-full h-full"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
          data-ad-slot={getAdSlot()}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Facebook Audience Network - Alternative */}
      {/* Uncomment when Facebook app ID is configured */}
      {/* <div
        className="fb-ad-block"
        data-placementid="YOUR_PLACEMENT_ID"
        data-format="auto"
      /> */}

      {/* Fallback placeholder when ads don't load */}
      {!adLoaded && (
        <Card className={`flex items-center justify-center ${getSizeClasses()} bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-dashed`}>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-semibold">Premium Ad Space</p>
            <p className="text-xs text-muted-foreground">
              Google Ads • Facebook Ads • Custom Campaigns
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface CustomAdProps {
  imageUrl?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CustomAd({ 
  imageUrl, 
  title, 
  description, 
  ctaText, 
  ctaUrl,
  size = 'medium',
  className = '' 
}: CustomAdProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-24';
      case 'large':
        return 'h-64';
      default:
        return 'h-32';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Badge variant="secondary" className="absolute top-2 right-2 z-10 text-xs opacity-60">
        Sponsored
      </Badge>
      
      <Card className={`overflow-hidden hover-elevate cursor-pointer ${getSizeClasses()}`}>
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
          <div className="flex h-full">
            {imageUrl && (
              <div className="w-1/3 relative">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`flex-1 p-4 flex flex-col justify-center ${imageUrl ? 'w-2/3' : 'w-full'}`}>
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{title}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
              <div className="mt-auto">
                <span className="text-xs font-semibold text-primary hover:underline">
                  {ctaText} →
                </span>
              </div>
            </div>
          </div>
        </a>
      </Card>
    </div>
  );
}
