import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Ad = {
  id: string;
  advertiser: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  targetUrl: string;
  adType: "pre-roll" | "mid-roll" | "post-roll" | "in-feed";
  platform: "vids" | "tube" | "in-feed";
  costPerView: number;
  costPerClick: number;
};

type AdPlayerProps = {
  ad: Ad;
  videoId: string;
  onComplete: () => void;
  onSkip?: () => void;
  skippable?: boolean;
  skipDelay?: number;
};

export function AdPlayer({ ad, videoId, onComplete, onSkip, skippable = true, skipDelay = 5 }: AdPlayerProps) {
  const [watchTime, setWatchTime] = useState(0);
  const [canSkip, setCanSkip] = useState(!skippable);
  const [viewTracked, setViewTracked] = useState(false);

  const trackViewMutation = useMutation({
    mutationFn: async (viewDuration: number) => {
      return await apiRequest(`/api/ads/${ad.id}/view`, "POST", {
        videoId,
        viewDuration,
      });
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (viewId: string) => {
      return await apiRequest(`/api/ads/${ad.id}/click`, "POST", { viewId });
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setWatchTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (watchTime >= skipDelay && skippable) {
      setCanSkip(true);
    }
  }, [watchTime, skipDelay, skippable]);

  // Track view after 3 seconds
  useEffect(() => {
    if (watchTime >= 3 && !viewTracked) {
      setViewTracked(true);
      trackViewMutation.mutate(watchTime);
    }
  }, [watchTime, viewTracked]);

  const handleSkip = () => {
    if (canSkip) {
      onSkip ? onSkip() : onComplete();
    }
  };

  const handleClick = async () => {
    if (trackViewMutation.data?.id) {
      await trackClickMutation.mutateAsync(trackViewMutation.data.id);
    }
    window.open(ad.targetUrl, "_blank");
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Ad Content */}
      {ad.videoUrl ? (
        <video
          src={ad.videoUrl}
          autoPlay
          muted
          onEnded={onComplete}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
      )}

      {/* Ad Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80">
        {/* Top Bar - Ad Label */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            AD
          </div>
          {canSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="bg-black/50 text-white hover:bg-black/70"
              data-testid="button-skip-ad"
            >
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>
          )}
          {!canSkip && skippable && (
            <div className="bg-black/50 text-white px-3 py-1 rounded text-xs">
              Skip in {skipDelay - watchTime}s
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="space-y-3">
            <p className="text-xs text-white/60">Sponsored by {ad.advertiser}</p>
            <h3 className="text-xl font-bold text-white">{ad.title}</h3>
            <p className="text-sm text-white/80">{ad.description}</p>
            <Button
              onClick={handleClick}
              className="bg-gradient-to-r from-pink-500 to-purple-600 w-full"
              data-testid="button-learn-more"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
