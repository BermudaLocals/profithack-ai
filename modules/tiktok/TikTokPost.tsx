/**
 * PROFITHACK AI - TikTok Core Module
 * Based on TikTok Clone Post.js reference
 * Adapted for React + TypeScript + PostgreSQL
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Heart, MessageCircle, Share2, Bookmark, Music2, 
  Pause, Play, Volume2, VolumeX, UserPlus, Check,
  MoreHorizontal, Flag, Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TikTokPostProps {
  id: string;
  videoUrl: string;
  caption: string;
  topic?: string;
  username: string;
  userId: string;
  profileImage?: string;
  company?: string;
  songName?: string;
  verified?: boolean;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
}

interface Comment {
  id: string;
  comment: string;
  username: string;
  userImage?: string;
  timestamp: string;
}

export function TikTokPost({
  id,
  videoUrl,
  caption,
  topic,
  username,
  userId,
  profileImage,
  company,
  songName,
  verified = false,
  isActive,
  isMuted,
  onMuteToggle,
}: TikTokPostProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Core state from reference
  const [playing, setPlaying] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isComOpen, setIsComOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch likes
  const { data: likesData } = useQuery<{ count: number; hasLiked: boolean }>({
    queryKey: ['/api/videos', id, 'likes'],
  });

  // Fetch comments
  const { data: commentsData } = useQuery<Comment[]>({
    queryKey: ['/api/videos', id, 'comments'],
  });

  const likes = likesData?.count || 0;
  const comments = commentsData || [];

  // Update hasLiked when data loads
  useEffect(() => {
    if (likesData?.hasLiked !== undefined) {
      setHasLiked(likesData.hasLiked);
    }
  }, [likesData]);

  // Video play/pause handler from reference
  const onVideoPress = () => {
    if (!videoRef.current) return;
    
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true));
    }
  };

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

  // Mute effect from reference
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/videos/${id}/like`, "POST", {}),
    onMutate: () => {
      setHasLiked(!hasLiked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos', id, 'likes'] });
    },
    onError: () => {
      setHasLiked(hasLiked);
      toast({ title: "Failed to like", variant: "destructive" });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (text: string) => apiRequest(`/api/videos/${id}/comments`, "POST", { comment: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos', id, 'comments'] });
      setComment("");
      toast({ title: "Comment added!" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => apiRequest(`/api/users/${userId}/follow`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Following!" });
    }
  });

  // Send comment handler from reference
  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({ title: "Comment field is empty", variant: "destructive" });
      return;
    }
    setLoading(true);
    commentMutation.mutate(comment);
    setLoading(false);
  };

  // Navigation handlers from reference
  const handleChangePage = () => {
    navigate(`/profile/${username}`);
  };

  const handleChangeDetailsPage = () => {
    navigate(`/video/${id}`);
  };

  // Check hashtag format from reference
  const tagCheck = topic?.match(/#/g);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative w-full h-screen bg-black snap-start"
    >
      {/* Video Container */}
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          playsInline
          muted={isMuted}
          onClick={onVideoPress}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          data-testid={`video-${id}`}
        />

        {/* Play/Pause Controls - shown on hover like reference */}
        {isHover && (
          <div className="absolute bottom-24 left-4 flex gap-4 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onVideoPress}
              className="p-2 bg-black/40 rounded-full"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" fill="white" />
              ) : (
                <Play className="w-6 h-6 text-white" fill="white" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMuteToggle}
              className="p-2 bg-black/40 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Right Side Actions - TikTok Style from reference */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Profile Avatar */}
        <div className="relative">
          <button onClick={handleChangePage} className="block" data-testid={`avatar-${id}`}>
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                {username?.[0]?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); followMutation.mutate(); }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
            data-testid={`follow-${id}`}
          >
            <UserPlus className="w-3 h-3 text-white" />
          </motion.button>
        </div>

        {/* Like Button - from reference */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button
            onClick={() => likeMutation.mutate()}
            className="flex flex-col items-center gap-1"
            data-testid={`like-${id}`}
          >
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart 
                className={cn("w-7 h-7 transition-colors", hasLiked ? "text-red-500 fill-red-500" : "text-white")} 
              />
            </div>
            <span className="text-white text-xs font-semibold">{likes}</span>
          </button>
        </motion.div>

        {/* Comments Button - from reference */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button
            onClick={() => setIsComOpen(!isComOpen)}
            className="flex flex-col items-center gap-1"
            data-testid={`comments-${id}`}
          >
            <div className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
              <MessageCircle 
                className={cn("w-7 h-7 transition-colors", isComOpen ? "text-blue-500" : "text-white")} 
              />
            </div>
            <span className="text-white text-xs font-semibold">{comments.length}</span>
          </button>
        </motion.div>

        {/* Share Button - from reference */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <button
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
            <span className="text-white text-xs font-semibold">Share</span>
          </button>
        </motion.div>

        {/* Spinning Music Disc */}
        <motion.div
          animate={{ rotate: playing ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-11 h-11 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
        </motion.div>
      </div>

      {/* Bottom Info - from reference structure */}
      <div className="absolute left-4 right-20 bottom-24 z-10">
        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={handleChangePage} className="flex items-center gap-2">
            <span className="text-white font-bold">@{username}</span>
            {verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
          {company && (
            <span className="text-gray-400 text-sm hidden md:block">{company}</span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="ml-4 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
            onClick={() => followMutation.mutate()}
          >
            Follow
          </Button>
        </div>

        {/* Caption - from reference */}
        <p className="text-white text-sm mb-2">
          {caption.length > 70 ? `${caption.slice(0, 100)}...` : caption}
        </p>

        {/* Hashtags - from reference */}
        {topic && (
          <p className="text-white font-semibold text-sm mb-2">
            {tagCheck ? topic : `#${topic}`}
          </p>
        )}

        {/* Song Name - from reference */}
        {songName && (
          <div className="flex items-center gap-2">
            {playing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Music2 className="w-4 h-4 text-white" />
              </motion.div>
            ) : (
              <Music2 className="w-4 h-4 text-white" />
            )}
            <span className="text-white text-sm">{songName}</span>
          </div>
        )}
      </div>

      {/* Comments Section - from reference */}
      {isComOpen && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg p-4 z-30 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">{comments.length} Comments</h3>
            <button onClick={() => setIsComOpen(false)} className="text-gray-400">
              Close
            </button>
          </div>
          
          {/* Comment Input */}
          <form onSubmit={sendComment} className="flex gap-2 mb-4">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 border-gray-700 text-white"
              data-testid="comment-input"
            />
            <Button 
              type="submit" 
              disabled={loading || !comment.trim()}
              className="bg-pink-500 hover:bg-pink-600"
              data-testid="send-comment"
            >
              {loading ? "..." : "Post"}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={c.userImage} />
                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                    {c.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">{c.username}</p>
                  <p className="text-white text-sm">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TikTokPost;
