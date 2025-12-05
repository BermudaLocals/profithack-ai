import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Play, Upload, Loader2, ChevronUp, ChevronDown, Gift } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UploadVideoDialog } from "@/components/UploadVideoDialog";
import { VideoCommentsDialog } from "@/components/VideoCommentsDialog";

type Video = {
  id: string;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  videoType: "short" | "long";
  quality: "sd" | "hd" | "fhd" | "4k";
  hashtags: string[];
  category: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  giftCount: number;
  createdAt: string;
  user?: {
    username: string;
    profileImageUrl: string;
  };
};

type LikeStatusResponse = {
  isLiked: boolean;
};

export default function Reels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [ageGatingError, setAgeGatingError] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(new Set<string>());
  const preloadRef = useRef<{ [key: string]: HTMLVideoElement }>({});

  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: ["/api/videos/reels"],
  });

  const currentVideo = videos?.[currentVideoIndex];

  // Handle age-gating errors
  useEffect(() => {
    if (error) {
      const errorMessage = error.message || "";
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        setAgeGatingError(true);
        toast({
          title: "Age verification required",
          description: "Some content requires age verification",
          variant: "destructive",
        });
      }
    }
  }, [error, toast]);

  // Get like status for current video
  const { data: likeStatus } = useQuery<LikeStatusResponse>({
    queryKey: ["/api/videos", currentVideo?.id, "like-status"],
    enabled: !!currentVideo?.id && !!user,
  });

  const isLiked = likeStatus?.isLiked || false;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiRequest("POST", `/api/videos/${videoId}/like`, {});
      return response.json();
    },
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/videos/reels"] });
      await queryClient.cancelQueries({ queryKey: ["/api/videos", videoId, "like-status"] });

      const previousVideos = queryClient.getQueryData<Video[]>(["/api/videos/reels"]);
      const previousLikeStatus = queryClient.getQueryData<LikeStatusResponse>([
        "/api/videos",
        videoId,
        "like-status",
      ]);

      // Optimistically update videos
      queryClient.setQueryData<Video[]>(["/api/videos/reels"], (old) =>
        old?.map((v) => (v.id === videoId ? { ...v, likeCount: v.likeCount + 1 } : v))
      );

      // Optimistically update like status
      queryClient.setQueryData<LikeStatusResponse>(
        ["/api/videos", videoId, "like-status"],
        { isLiked: true }
      );

      return { previousVideos, previousLikeStatus };
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/reels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId, "like-status"] });
    },
    onError: (error: Error, videoId, context) => {
      if (context?.previousVideos) {
        queryClient.setQueryData(["/api/videos/reels"], context.previousVideos);
      }
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(
          ["/api/videos", videoId, "like-status"],
          context.previousLikeStatus
        );
      }
      toast({
        title: "Failed to like video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiRequest("DELETE", `/api/videos/${videoId}/like`, {});
      return response.json();
    },
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/videos/reels"] });
      await queryClient.cancelQueries({ queryKey: ["/api/videos", videoId, "like-status"] });

      const previousVideos = queryClient.getQueryData<Video[]>(["/api/videos/reels"]);
      const previousLikeStatus = queryClient.getQueryData<LikeStatusResponse>([
        "/api/videos",
        videoId,
        "like-status",
      ]);

      // Optimistically update videos
      queryClient.setQueryData<Video[]>(["/api/videos/reels"], (old) =>
        old?.map((v) =>
          v.id === videoId ? { ...v, likeCount: Math.max(0, v.likeCount - 1) } : v
        )
      );

      // Optimistically update like status
      queryClient.setQueryData<LikeStatusResponse>(
        ["/api/videos", videoId, "like-status"],
        { isLiked: false }
      );

      return { previousVideos, previousLikeStatus };
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos/reels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos", videoId, "like-status"] });
    },
    onError: (error: Error, videoId, context) => {
      if (context?.previousVideos) {
        queryClient.setQueryData(["/api/videos/reels"], context.previousVideos);
      }
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(
          ["/api/videos", videoId, "like-status"],
          context.previousLikeStatus
        );
      }
      toast({
        title: "Failed to unlike video",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle like/unlike toggle
  const handleLikeToggle = () => {
    if (!currentVideo || !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like videos",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate(currentVideo.id);
    } else {
      likeMutation.mutate(currentVideo.id);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!currentVideo) return;

    const videoUrl = `${window.location.origin}/vids/${currentVideo.id}`;

    try {
      await navigator.clipboard.writeText(videoUrl);
      toast({
        title: "Link copied!",
        description: "Video link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  // Track video view (fire and forget)
  useEffect(() => {
    if (!currentVideo || !user) return;
    if (viewTrackedRef.current.has(currentVideo.id)) return;

    viewTrackedRef.current.add(currentVideo.id);

    // Fire and forget - don't await or handle errors
    apiRequest("POST", `/api/videos/${currentVideo.id}/view`, {
      videoId: currentVideo.id,
      watchDuration: 0,
    }).catch(() => {
      // Silently fail - don't show errors to user
    });
  }, [currentVideo?.id, user]);

  // Preload next 2-3 videos for smooth experience
  useEffect(() => {
    if (!videos) return;

    // Preload next 2-3 videos
    const preloadCount = 3;
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentVideoIndex + i;
      if (nextIndex < videos.length) {
        const nextVideo = videos[nextIndex];
        
        // Only create new preload element if it doesn't exist
        if (!preloadRef.current[nextVideo.id]) {
          const videoElement = document.createElement('video');
          videoElement.src = nextVideo.videoUrl;
          videoElement.preload = 'auto';
          videoElement.muted = true;
          videoElement.playsInline = true;
          videoElement.style.display = 'none';
          preloadRef.current[nextVideo.id] = videoElement;
        }
      }
    }

    // Cleanup old preloaded videos to free memory
    Object.keys(preloadRef.current).forEach(videoId => {
      const videoIndex = videos.findIndex(v => v.id === videoId);
      if (videoIndex !== -1 && Math.abs(videoIndex - currentVideoIndex) > preloadCount) {
        delete preloadRef.current[videoId];
      }
    });
  }, [currentVideoIndex, videos]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevVideo();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNextVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideoIndex, videos]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling) return;

      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 500);

      if (e.deltaY > 0) {
        handleNextVideo();
      } else if (e.deltaY < 0) {
        handlePrevVideo();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [currentVideoIndex, videos, isScrolling]);

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Minimum swipe distance (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped up - next video
        handleNextVideo();
      } else {
        // Swiped down - previous video
        handlePrevVideo();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (ageGatingError) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-3xl">🔞</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Age Verification Required</h2>
          <p className="text-slate-400 mb-4">
            Some content requires age verification. Please verify your age in your profile settings.
          </p>
        </div>
      </div>
    );
  }

  const handleNextVideo = () => {
    if (videos && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* TikTok-style vertical video container */}
      <div className="relative h-full flex items-center justify-center">
        {currentVideo ? (
          <>
            {/* Video Player */}
            <div className="relative w-full max-w-[600px] h-full bg-black">
              <video
                key={currentVideo.id}
                className="w-full h-full object-contain"
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnailUrl}
                controls
                autoPlay
                loop
                playsInline
                data-testid={`video-player-${currentVideo.id}`}
              />

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <div className="flex items-start gap-3">
                  {/* Creator Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                      {currentVideo.user?.profileImageUrl ? (
                        <img
                          src={currentVideo.user.profileImageUrl}
                          alt={currentVideo.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {currentVideo.user?.username?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm" data-testid={`username-${currentVideo.id}`}>
                        @{currentVideo.user?.username || "Unknown"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-white/20 hover:bg-white/10"
                        data-testid="button-follow"
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2" data-testid={`title-${currentVideo.id}`}>
                      {currentVideo.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentVideo.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-cyan-400"
                          data-testid={`hashtag-${currentVideo.id}-${idx}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Right Side) */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                <button
                  onClick={handleLikeToggle}
                  className="flex flex-col items-center gap-1 text-white"
                  data-testid={`button-like-${currentVideo.id}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover-elevate active-elevate-2">
                    <Heart 
                      className={`w-6 h-6 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`}
                    />
                  </div>
                  <span className="text-xs font-semibold">{currentVideo.likeCount}</span>
                </button>

                <VideoCommentsDialog
                  videoId={currentVideo.id}
                  commentCount={currentVideo.commentCount}
                />

                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 text-white"
                  data-testid={`button-share-${currentVideo.id}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover-elevate active-elevate-2">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">Share</span>
                </button>

                <button
                  onClick={() => {
                    toast({
                      title: "Send a Gift! 🎁",
                      description: "Gift feature coming soon - support your favorite creators!",
                    });
                  }}
                  className="flex flex-col items-center gap-1 text-white"
                  data-testid={`button-gift-${currentVideo.id}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 backdrop-blur flex items-center justify-center hover-elevate active-elevate-2 animate-pulse">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold">{currentVideo.giftCount || 0}</span>
                </button>
              </div>
            </div>

            {/* Navigation Indicators (Mobile & Desktop) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col gap-2 z-50">
              {currentVideoIndex > 0 && (
                <Button
                  onClick={handlePrevVideo}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20"
                  data-testid="button-prev-video"
                >
                  <ChevronUp className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-32 flex flex-col gap-2 z-50">
              {videos && currentVideoIndex < videos.length - 1 && (
                <Button
                  onClick={handleNextVideo}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20"
                  data-testid="button-next-video"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Video Counter */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs">
              {currentVideoIndex + 1} / {videos?.length || 0}
            </div>
          </>
        ) : (
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No videos yet</p>
            <p className="text-sm text-white/60 mb-4">Be the first to upload!</p>
            <UploadVideoDialog
              trigger={
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                  data-testid="button-upload-first"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* Upload Button (Floating) */}
      <div className="fixed bottom-20 right-6 z-50">
        <UploadVideoDialog />
      </div>
    </div>
  );
}
