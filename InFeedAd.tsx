import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

type Ad = {
  id: string;
  advertiser: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  costPerView: number;
  costPerClick: number;
};

type InFeedAdProps = {
  ad: Ad;
  videoId: string;
};

export function InFeedAd({ ad, videoId }: InFeedAdProps) {
  const [viewTracked, setViewTracked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const trackViewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/ads/${ad.id}/view`, "POST", {
        videoId,
        viewDuration: 0,
      });
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (viewId: string) => {
      return await apiRequest(`/api/ads/${ad.id}/click`, "POST", { viewId });
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`ad-${ad.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ad.id]);

  useEffect(() => {
    if (isVisible && !viewTracked) {
      setViewTracked(true);
      trackViewMutation.mutate();
    }
  }, [isVisible, viewTracked]);

  const handleClick = async () => {
    if (trackViewMutation.data?.id) {
      await trackClickMutation.mutateAsync(trackViewMutation.data.id);
    }
    window.open(ad.targetUrl, "_blank");
  };

  return (
    <Card
      id={`ad-${ad.id}`}
      className="relative overflow-hidden hover-elevate cursor-pointer"
      onClick={handleClick}
      data-testid={`ad-card-${ad.id}`}
    >
      {/* Ad Badge */}
      <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
        Sponsored
      </div>

      {/* Ad Image */}
      <div className="aspect-video bg-muted relative">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Ad Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">{ad.advertiser}</p>
            <h3 className="font-semibold text-sm line-clamp-2">{ad.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {ad.description}
            </p>
          </div>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
          size="sm"
          data-testid={`button-ad-cta-${ad.id}`}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Learn More
        </Button>
      </div>
    </Card>
  );
}
