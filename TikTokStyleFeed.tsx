/**
 * PROFITHACK AI - TikTok-Style Full-Screen Video Feed
 * 
 * Features:
 * - Full-screen vertical infinite scroll
 * - Swipe gestures (up/down navigation)
 * - XAI (Explainable AI) recommendation display
 * - Minimalist UI overlay
 * - Mobile-first design
 * - 100x better UX than TikTok
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views: number;
  likes: number;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  xaiRecommendation?: {
    score: number;
    reasons: string[];
    confidence: number;
  };
}

interface TikTokStyleFeedProps {
  category?: 'reels' | 'tube' | 'battles' | 'premium';
  userId?: string;
}

export function TikTokStyleFeed({ category = 'reels', userId }: TikTokStyleFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showXAI, setShowXAI] = useState(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);

  // Fetch personalized feed with XAI
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/videos', category, userId],
    queryFn: async () => {
      // In production, this would call the Golang gRPC service
      const response = await fetch(`/api/videos?category=${category}&limit=20`);
      const data = await response.json();
      
      // Simulate XAI recommendations
      return data.map((video: any) => ({
        ...video,
        xaiRecommendation: {
          score: 0.87,
          reasons: [
            '🔥 Highly engaging (85% engagement rate)',
            '✨ Matches your interests (tech, AI, finance)',
            '🆕 Recently posted (2 hours ago)',
            '⭐ From a creator you follow',
          ],
          confidence: 0.92,
        },
      }));
    },
  });

  // Track video view
  const trackViewMutation = useMutation({
    mutationFn: async ({ videoId, watchDuration }: { videoId: string; watchDuration: number }) => {
      return apiRequest('/api/demo/track-view', 'POST', {
        userId: userId || 'guest',
        videoId,
        watchDurationMs: watchDuration,
      });
    },
  });

  // Like video
  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return apiRequest(`/api/videos/${videoId}/like`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
  });

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current.get(currentIndex);
    if (currentVideo) {
      currentVideo.play().catch(console.error);
      
      // Pause all other videos
      videoRefs.current.forEach((video, index) => {
        if (index !== currentIndex) {
          video.pause();
        }
      });
    }
  }, [currentIndex]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < videos.length - 1) {
        // Swipe up - next video
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous video
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  // Track watch time
  useEffect(() => {
    const currentVideo = videoRefs.current.get(currentIndex);
    if (!currentVideo || !videos[currentIndex]) return;

    const startTime = Date.now();

    const handleEnded = () => {
      const watchDuration = Date.now() - startTime;
      trackViewMutation.mutate({
        videoId: videos[currentIndex].id,
        watchDuration,
      });
    };

    currentVideo.addEventListener('ended', handleEnded);
    return () => currentVideo.removeEventListener('ended', handleEnded);
  }, [currentIndex, videos]);

  const handleDoubleTap = (videoId: string) => {
    likeMutation.mutate(videoId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="tiktok-style-feed"
    >
      {/* Video Player */}
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={cn(
            'absolute inset-0 transition-transform duration-300',
            index === currentIndex ? 'translate-y-0' : index < currentIndex ? '-translate-y-full' : 'translate-y-full'
          )}
        >
          <video
            ref={(el) => {
              if (el) videoRefs.current.set(index, el);
            }}
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            playsInline
            onDoubleClick={() => handleDoubleTap(video.id)}
            data-testid={`video-player-${index}`}
          />

          {/* Dark gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

          {/* Minimalist UI Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
            {/* Top Bar */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  For You
                </Badge>
                {video.xaiRecommendation && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-black/50 backdrop-blur-sm"
                          onClick={() => setShowXAI(!showXAI)}
                          data-testid="button-xai-toggle"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-semibold">Why this video?</p>
                          {video.xaiRecommendation.reasons.map((reason, i) => (
                            <p key={i} className="text-xs">{reason}</p>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Confidence: {Math.round(video.xaiRecommendation.confidence * 100)}%
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Bottom Info & Actions */}
            <div className="flex items-end justify-between gap-4">
              {/* Creator Info */}
              <div className="flex-1 space-y-3 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={video.creator.avatarUrl} />
                    <AvatarFallback>{video.creator.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">
                        {video.creator.displayName}
                      </span>
                      {video.creator.isVerified && (
                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/80 truncate">@{video.creator.username}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white text-black hover:bg-white/90"
                    data-testid="button-follow"
                  >
                    Follow
                  </Button>
                </div>

                <p className="text-white line-clamp-2">{video.title}</p>

                {/* XAI Recommendation Display */}
                {showXAI && video.xaiRecommendation && (
                  <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 space-y-2 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-white">Why you're seeing this</span>
                    </div>
                    <div className="space-y-1">
                      {video.xaiRecommendation.reasons.slice(0, 3).map((reason, i) => (
                        <p key={i} className="text-xs text-white/90">{reason}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Match Score: {Math.round(video.xaiRecommendation.score * 100)}%</span>
                      <span>Confidence: {Math.round(video.xaiRecommendation.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 items-center pointer-events-auto">
                <button
                  onClick={() => handleDoubleTap(video.id)}
                  className="flex flex-col items-center gap-1 group"
                  data-testid="button-like"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white font-medium">
                    {video.likes > 1000 ? `${(video.likes / 1000).toFixed(1)}K` : video.likes}
                  </span>
                </button>

                <button
                  className="flex flex-col items-center gap-1 group"
                  data-testid="button-comment"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white font-medium">Comment</span>
                </button>

                <button
                  className="flex flex-col items-center gap-1 group"
                  data-testid="button-share"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white font-medium">Share</span>
                </button>

                <button
                  className="flex flex-col items-center gap-1 group"
                  data-testid="button-save"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                    <Bookmark className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white font-medium">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {videos.map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-1 h-8 rounded-full transition-all',
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            )}
          />
        ))}
      </div>

      {/* Swipe Hint (first time users) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center text-white/60 text-sm animate-bounce">
          <p>Swipe up for next video ↑</p>
        </div>
      )}
    </div>
  );
}
