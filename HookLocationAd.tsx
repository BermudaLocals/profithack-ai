import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HookAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  advertiser: string;
}

interface HookLocationAdProps {
  ads: HookAd[];
  autoRotateInterval?: number;
}

export function HookLocationAd({ 
  ads, 
  autoRotateInterval = 6000 
}: HookLocationAdProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [ads.length, autoRotateInterval]);

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
    <div className="relative min-h-[140px] md:min-h-[200px] flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2 md:space-y-4 cursor-pointer group"
          onClick={handleAdClick}
          data-testid={`hook-ad-${currentAd.id}`}
        >
          <Badge variant="secondary" className="mb-2">
            Sponsored
          </Badge>

          {currentAd.imageUrl && (
            <div className="mx-auto w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-outlined-thick flex items-center justify-center gap-2">
            {currentAd.title}
            <ExternalLink className="w-6 h-6 md:w-8 md:h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white text-outlined-thin">
            {currentAd.description}
          </p>
          <p className="text-sm text-white/70">
            by {currentAd.advertiser}
          </p>
        </motion.div>
      </AnimatePresence>

      {ads.length > 1 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              data-testid={`hook-ad-dot-${index}`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function useHookLocationAds(limit: number = 2) {
  const [ads, setAds] = useState<HookAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/ads?type=hook_location&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setAds(data);
        }
      } catch (error) {
        console.error("Error fetching hook location ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [limit]);

  return { ads, loading };
}
