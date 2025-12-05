import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  advertiser: string;
}

interface RotatingAdsProps {
  ads: Ad[];
  autoRotateInterval?: number; // milliseconds (default: 5000 = 5 seconds)
  showControls?: boolean;
}

export function RotatingAds({ 
  ads, 
  autoRotateInterval = 5000,
  showControls = true 
}: RotatingAdsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate ads
  useEffect(() => {
    if (!ads || ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [ads, autoRotateInterval, isPaused]);

  if (!ads || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
    setIsPaused(true);
  };

  const handleAdClick = async () => {
    // Track ad click
    try {
      await fetch(`/api/ads/${currentAd.id}/click`, {
        method: "POST",
      });
      
      // Open ad in new tab
      window.open(currentAd.targetUrl, "_blank");
    } catch (error) {
      console.error("Error tracking ad click:", error);
      window.open(currentAd.targetUrl, "_blank");
    }
  };

  // Track ad view on mount and when ad changes
  useEffect(() => {
    if (!currentAd) return;

    const trackView = async () => {
      try {
        await fetch(`/api/ads/${currentAd.id}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error tracking ad view:", error);
      }
    };

    trackView();
  }, [currentAd]);

  return (
    <Card className="relative overflow-hidden hover-elevate" data-testid={`rotating-ad-${currentAd.id}`}>
      {/* Sponsored Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className="text-xs">
          Sponsored
        </Badge>
      </div>

      {/* Navigation Controls */}
      {showControls && ads.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70"
            onClick={handlePrevious}
            data-testid="button-ad-previous"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70"
            onClick={handleNext}
            data-testid="button-ad-next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </Button>
        </>
      )}

      {/* Ad Content */}
      <CardContent 
        className="p-0 cursor-pointer"
        onClick={handleAdClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ad Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {currentAd.imageUrl ? (
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ExternalLink className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Ad Details */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{currentAd.title}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {currentAd.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              by {currentAd.advertiser}
            </p>
            <Button size="sm" variant="outline" className="gap-1">
              Learn More
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Progress Indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPaused(true);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 w-1.5 hover:bg-white/70"
              }`}
              data-testid={`ad-indicator-${index}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// Hook for fetching rotating ads
export function useRotatingAds(placement: string, limit: number = 5) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/ads`);
        if (response.ok) {
          const data = await response.json();
          // Filter and limit ads based on placement
          const filteredAds = data
            .filter((ad: any) => ad.placement === placement || !ad.placement)
            .slice(0, limit);
          setAds(filteredAds);
        }
      } catch (error) {
        console.error("Error fetching rotating ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement, limit]);

  return { ads, loading };
}
