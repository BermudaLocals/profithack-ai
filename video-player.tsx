import { useState, useRef } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Video } from "@shared/schema";
import { Heart, Star, Rocket, Flame, Diamond, Crown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

const GIFT_CATALOG = [
  { type: "heart", icon: Heart, cost: 10, label: "Heart", color: "text-pink-400" },
  { type: "star", icon: Star, cost: 50, label: "Star", color: "text-yellow-400" },
  { type: "rocket", icon: Rocket, cost: 100, label: "Rocket", color: "text-cyan-400" },
  { type: "fire", icon: Flame, cost: 250, label: "Fire", color: "text-orange-400" },
  { type: "diamond", icon: Diamond, cost: 500, label: "Diamond", color: "text-blue-400" },
  { type: "crown", icon: Crown, cost: 1000, label: "Crown", color: "text-purple-400" },
];

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showGifts, setShowGifts] = useState(false);
  const plyrRef = useRef<any>(null);

  const plyrOptions = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen',
    ],
    autoplay: false,
    muted: false,
    clickToPlay: true,
    hideControls: true,
    resetOnEnd: false,
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
  };

  const sendGiftMutation = useMutation({
    mutationFn: async (giftType: string) => {
      return await apiRequest("/api/gifts", "POST", {
        receiverId: video.userId,
        videoId: video.id,
        giftType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Gift sent!",
        description: "Your gift has been sent to the creator.",
      });
      setShowGifts(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send gift",
        description: error.message || "Insufficient credits or error occurred.",
      });
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
            data-testid="button-close-video"
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* Plyr Video Player */}
          <div className="aspect-[9/16] bg-black flex items-center justify-center max-h-[70vh]">
            {video.videoUrl ? (
              <div className="w-full h-full" data-testid="video-player">
                <Plyr
                  ref={plyrRef}
                  source={{
                    type: 'video',
                    sources: [
                      {
                        src: video.videoUrl,
                        type: 'video/mp4',
                      },
                    ],
                  }}
                  options={plyrOptions}
                />
              </div>
            ) : (
              <div className="text-white">No video available</div>
            )}
          </div>

          {/* Video Info & Actions */}
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold">{video.title}</h3>
                <Badge variant={video.ageRating === "u16" ? "secondary" : "default"}>
                  {video.ageRating === "u16" ? "U16" : video.ageRating === "16plus" ? "16+" : "18+"}
                </Badge>
              </div>
              {video.description && (
                <p className="text-muted-foreground">{video.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{video.viewCount} views</span>
              <span>{video.likeCount} likes</span>
            </div>

            {user?.id !== video.userId && (
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                onClick={() => setShowGifts(!showGifts)}
                data-testid="button-send-gift"
              >
                <Heart className="w-4 h-4 mr-2" />
                Send Gift
              </Button>
            )}

            {showGifts && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                {GIFT_CATALOG.map((gift) => {
                  const Icon = gift.icon;
                  return (
                    <button
                      key={gift.type}
                      onClick={() => sendGiftMutation.mutate(gift.type)}
                      disabled={sendGiftMutation.isPending || (user?.credits || 0) < gift.cost}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border hover-elevate active-elevate-2 disabled:opacity-50"
                      data-testid={`button-gift-${gift.type}`}
                    >
                      <Icon className={`w-8 h-8 ${gift.color}`} />
                      <span className="text-sm font-medium">{gift.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {gift.cost} credits
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {showGifts && (
              <div className="text-sm text-muted-foreground text-center">
                Your balance: {user?.credits || 0} credits
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
