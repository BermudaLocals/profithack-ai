import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SideAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  advertiser: string;
}

interface RotatingSideAdsProps {
  ads: SideAd[];
  autoRotateInterval?: number;
  className?: string;
}

export function RotatingSideAds({ 
  ads, 
  autoRotateInterval = 6000,
  className = ""
}: RotatingSideAdsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [ads.length, autoRotateInterval, isPaused]);

  if (!ads || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  const handleAdClick = async () => {
    try {
      await fetch(`/api/ads/${currentAd.id}/click`, {
        method: "POST",
      });
      window.open(currentAd.targetUrl, "_blank");
    } catch (error) {
      console.error("Error tracking ad click:", error);
      window.open(currentAd.targetUrl, "_blank");
    }
  };

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
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <Card 
            className="relative overflow-hidden hover-elevate cursor-pointer"
            onClick={handleAdClick}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            data-testid={`sidebar-ad-${currentAd.id}`}
          >
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="text-xs">
                Sponsored
              </Badge>
            </div>

            <CardContent className="p-0">
              <div className="relative h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {currentAd.imageUrl ? (
                  <img
                    src={currentAd.imageUrl}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-3">
                <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                  {currentAd.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {currentAd.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {currentAd.advertiser}
                </p>
              </div>
            </CardContent>

            {ads.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                      setIsPaused(true);
                    }}
                    className={`h-1 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-white w-4"
                        : "bg-white/40 w-1 hover:bg-white/60"
                    }`}
                    data-testid={`sidebar-ad-dot-${index}`}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function useSidebarAds(limit: number = 3) {
  const [ads, setAds] = useState<SideAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/ads?type=rotating_sidebar&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setAds(data);
        }
      } catch (error) {
        console.error("Error fetching sidebar ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [limit]);

  return { ads, loading };
}
