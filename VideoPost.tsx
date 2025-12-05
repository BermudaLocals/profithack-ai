/**
 * PROFITHACK AI - TikTok-Style Video Post Component
 * Based on TikTok clone reference with PostgreSQL + React
 * Features: Like, Comment, Share, Follow, Play/Pause, Mute
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, MessageCircle, Share2, Bookmark, Music2, Pause, Play, Volume2, VolumeX, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VideoPostProps {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags?: string[];
  soundName?: string;
  username: string;
  userId: string;
  profileImage?: string;
  displayName?: string;
  verified?: boolean;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  hasLiked?: boolean;
  hasFollowed?: boolean;
  hasSaved?: boolean;
}

export function VideoPost({
  id,
  videoUrl,
  thumbnailUrl,
  caption,
  hashtags = [],
  soundName,
  username,
  userId,
  profileImage,
  displayName,
  verified = false,
  likes,
  comments,
  shares,
  views,
  isActive,
  isMuted,
  onMuteToggle,
  hasLiked: initialLiked = false,
  hasFollowed: initialFollowed = false,
  hasSaved: initialSaved = false,
}: VideoPostProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isFollowing, setIsFollowing] = useState(initialFollowed);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/videos/${id}/like`, "POST", {}),
    onMutate: () => {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: () => {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast({ title: "Failed to like", variant: "destructive" });
    }
  });

  // Follow mutation  
  const followMutation = useMutation({
    mutationFn: () => apiRequest(`/api/users/${userId}/follow`, "POST", {}),
    onMutate: () => {
      setIsFollowing(!isFollowing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: isFollowing ? "Unfollowed" : "Following!" });
    },
    onError: () => {
      setIsFollowing(isFollowing);
      toast({ title: "Failed to follow", variant: "destructive" });
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/videos/${id}/save`, "POST", {}),
    onMutate: () => {
      setIsSaved(!isSaved);
    },
    onSuccess: () => {
      toast({ title: isSaved ? "Removed from saved" : "Saved!" });
    }
  });

  // Auto-play when active
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {
          videoRef.current!.muted = true;
          videoRef.current!.play().then(() => setPlaying(true));
        });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive, isMuted]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true));
    }
  };

  // Navigate to user profile
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  // Navigate to video detail
  const goToDetail = () => {
    navigate(`/video/${id}`);
  };

  // Format numbers TikTok-style
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="relative w-full h-screen bg-black snap-start overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        data-testid={`video-${id}`}
      />

      {/* Play/Pause Overlay */}
      {!playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </motion.div>
        </div>
      )}

      {/* Right Side Actions - TikTok Style */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Profile Avatar with Follow Button */}
        <div className="relative">
          <button onClick={goToProfile} className="block" data-testid={`avatar-${id}`}>
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                {username?.[0]?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
          </button>
          {!isFollowing && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); followMutation.mutate(); }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
              data-testid={`follow-${id}`}
            >
              <UserPlus className="w-3 h-3 text-white" />
            </motion.button>
          )}
        </div>

        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => likeMutation.mutate()}
          className="flex flex-col items-center gap-1"
          data-testid={`like-${id}`}
        >
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Heart 
              className={cn("w-7 h-7 transition-colors", isLiked ? "text-pink-500 fill-pink-500" : "text-white")} 
            />
          </div>
          <span className="text-white text-xs font-semibold">{formatNumber(likeCount)}</span>
        </motion.button>

        {/* Comments Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
          data-testid={`comments-${id}`}
        >
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatNumber(comments)}</span>
        </motion.button>

        {/* Save/Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => saveMutation.mutate()}
          className="flex flex-col items-center gap-1"
          data-testid={`save-${id}`}
        >
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bookmark 
              className={cn("w-7 h-7 transition-colors", isSaved ? "text-yellow-400 fill-yellow-400" : "text-white")} 
            />
          </div>
          <span className="text-white text-xs font-semibold">{formatNumber(views)}</span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            navigator.share?.({ url: `${window.location.origin}/video/${id}` })
              .catch(() => {
                navigator.clipboard.writeText(`${window.location.origin}/video/${id}`);
                toast({ title: "Link copied!" });
              });
          }}
          className="flex flex-col items-center gap-1"
          data-testid={`share-${id}`}
        >
          <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatNumber(shares)}</span>
        </motion.button>

        {/* Spinning Music Disc */}
        <motion.div
          animate={{ rotate: playing ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-11 h-11 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center mt-2"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
        </motion.div>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute left-4 right-20 bottom-24 z-10">
        {/* Username */}
        <button 
          onClick={goToProfile}
          className="flex items-center gap-1.5 mb-2"
          data-testid={`username-${id}`}
        >
          <span className="text-white font-bold text-base">@{username}</span>
          {verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>

        {/* Caption */}
        <p className="text-white text-sm mb-2 line-clamp-2">{caption}</p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-white text-sm font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Sound/Music */}
        {soundName && (
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-white" />
            <div className="overflow-hidden">
              <motion.span
                animate={{ x: playing ? [0, -100, 0] : 0 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="text-white text-sm whitespace-nowrap"
              >
                {soundName}
              </motion.span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
          className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          data-testid="mute-toggle"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default VideoPost;
