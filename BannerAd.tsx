import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BannerAdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  advertiser: string;
}

interface BannerAdProps {
  ad: BannerAdData;
  onClose?: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function BannerAd({ 
  ad, 
  onClose,
  position = "bottom",
  className = ""
}: BannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = async () => {
    try {
      await fetch(`/api/ads/${ad.id}/click`, {
        method: "POST",
      });
      window.open(ad.targetUrl, "_blank");
    } catch (error) {
      console.error("Error tracking ad click:", error);
      window.open(ad.targetUrl, "_blank");
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/ads/${ad.id}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error tracking ad view:", error);
      }
    };

    trackView();
  }, [ad.id]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed left-0 right-0 z-50 bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-sm
        ${position === "top" ? "top-0" : "bottom-0"}
        ${className}
      `}
      data-testid={`banner-ad-${ad.id}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2">
          <Badge variant="secondary" className="text-xs shrink-0">
            Sponsored
          </Badge>

          <div 
            className="flex-1 flex items-center gap-4 cursor-pointer hover-elevate rounded-md px-3 py-1"
            onClick={handleClick}
          >
            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-white truncate">
                {ad.title}
              </h4>
              <p className="text-xs text-white/80 truncate">
                {ad.description}
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0">
              Learn More
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            className="shrink-0 text-white hover:bg-white/20"
            data-testid="button-close-banner-ad"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useBannerAd(platform: string = "global") {
  const [ad, setAd] = useState<BannerAdData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerAd = async () => {
      try {
        const response = await fetch(`/api/ads?type=banner&platform=${platform}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setAd(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching banner ad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerAd();
  }, [platform]);

  return { ad, loading };
}
