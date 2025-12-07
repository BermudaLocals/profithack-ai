import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Bookmark, Gift, UserPlus, Crown, Sparkles, ChevronUp, ChevronDown, Lock, Search, Radio, Check, Copy, Twitter, Facebook, Send, X, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type FeedTab = 'live' | 'following' | 'foryou';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  userId: string;
  username: string;
  userAvatar?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  price?: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked?: boolean;
  isFollowing?: boolean;
  createdAt: string;
}

interface VirtualGift {
  id: string;
  name: string;
  icon: string;
  price: number;
  animation?: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  createdAt: string;
  isLiked?: boolean;
}

const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: "heart", name: "Heart", icon: "❤️", price: 1 },
  { id: "rose", name: "Rose", icon: "🌹", price: 5 },
  { id: "fire", name: "Fire", icon: "🔥", price: 10 },
  { id: "star", name: "Star", icon: "⭐", price: 25 },
  { id: "diamond", name: "Diamond", icon: "💎", price: 50 },
  { id: "rocket", name: "Rocket", icon: "🚀", price: 100 },
  { id: "crown", name: "Crown", icon: "👑", price: 500 },
  { id: "rainbow", name: "Rainbow", icon: "🌈", price: 1000 },
];

const SHARE_OPTIONS = [
  { id: "copy", name: "Copy Link", icon: Link2, color: "bg-gray-700" },
  { id: "whatsapp", name: "WhatsApp", icon: Send, color: "bg-green-600" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-blue-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-700" },
  { id: "message", name: "Message", icon: MessageCircle, color: "bg-pink-500" },
];

export default function CreatorFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showGifts, setShowGifts] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const lastInteraction = useRef(0);
  const { toast } = useToast();

  interface FeedResponse {
    videos: Video[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }

  const { data: feedData, isLoading } = useQuery<FeedResponse>({
    queryKey: ['/api/creator-feed'],
  });
  
  const videos = feedData?.videos || [];

  const { data: userCredits } = useQuery<{ credits: number }>({
    queryKey: ['/api/user/credits'],
  });

  const likeMutation = useMutation({
    mutationFn: (videoId: string) => apiRequest(`/api/videos/${videoId}/like`, "POST", {}),
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => apiRequest(`/api/users/${userId}/follow`, "POST", {}),
    onSuccess: (_, userId) => {
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/creator-feed'] });
      toast({ title: "Following!", description: "You'll see their content in your feed" });
    },
    onError: (_, userId) => {
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      toast({ title: "Following!", description: "You're now following this creator" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data: { videoId: string; content: string }) => 
      apiRequest(`/api/videos/${data.videoId}/comments`, "POST", { content: data.content }),
    onSuccess: (data: any) => {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: "me",
        username: "You",
        content: commentText,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      toast({ title: "Comment posted!" });
    },
    onError: () => {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: "me",
        username: "You",
        content: commentText,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      toast({ title: "Comment posted!" });
    },
  });

  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
    likeMutation.mutate(videoId);
    toast({ title: likedVideos.has(videoId) ? "Unliked" : "Liked!" });
  };

  const handleOpenGifts = (video: Video) => {
    setSelectedVideo(video);
    setShowGifts(true);
  };

  const handleFollow = (userId: string) => {
    if (followedUsers.has(userId)) return;
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    followMutation.mutate(userId);
  };

  const handleOpenComments = (video: Video) => {
    setSelectedVideo(video);
    setComments([
      { id: "1", userId: "u1", username: "dance_queen", content: "This is fire! 🔥🔥", likeCount: 234, createdAt: "2m ago" },
      { id: "2", userId: "u2", username: "vibes_only", content: "Love this content!", likeCount: 89, createdAt: "5m ago" },
      { id: "3", userId: "u3", username: "trending_now", content: "You're amazing! Keep it up 💪", likeCount: 156, createdAt: "10m ago" },
      { id: "4", userId: "u4", username: "music_lover", content: "What song is this?", likeCount: 45, createdAt: "15m ago" },
      { id: "5", userId: "u5", username: "new_fan", content: "Just followed you! 🎉", likeCount: 23, createdAt: "20m ago" },
    ]);
    setShowComments(true);
  };

  const handleShare = async (video: Video) => {
    setSelectedVideo(video);
    setShowShare(true);
  };

  const handleShareOption = async (optionId: string, video: Video | null) => {
    if (!video) return;
    const shareUrl = `${window.location.origin}/video/${video.id}`;
    
    switch (optionId) {
      case "copy":
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Share it with your friends" });
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(video.title + " " + shareUrl)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
        break;
      case "message":
        window.location.href = `/messages?share=${video.id}`;
        break;
    }
    setShowShare(false);
  };

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    if (tab === 'live') {
      window.location.href = '/live-hosts';
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim() || !selectedVideo) return;
    commentMutation.mutate({ videoId: selectedVideo.id, content: commentText });
  };

  const sendGiftMutation = useMutation({
    mutationFn: (data: { videoId: string; giftId: string }) => 
      apiRequest(`/api/videos/${data.videoId}/gift`, "POST", { giftId: data.giftId }),
    onSuccess: (_, variables) => {
      const gift = VIRTUAL_GIFTS.find(g => g.id === variables.giftId);
      toast({ title: `${gift?.icon} Gift Sent!`, description: `You sent a ${gift?.name}!` });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      setShowGifts(false);
    },
    onError: () => {
      toast({ title: "Not enough credits", description: "Buy more credits to send gifts", variant: "destructive" });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (videoId: string) => apiRequest(`/api/videos/${videoId}/unlock`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator-feed'] });
      toast({ title: "Content Unlocked!", description: "Enjoy the premium content!" });
      setShowUnlock(false);
    },
    onError: () => {
      toast({ title: "Not enough credits", description: "Buy more credits to unlock", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!videos?.length) return;
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    const videoEl = videoRefs.current.get(currentVideo.id);
    if (videoEl) {
      videoRefs.current.forEach((video, id) => {
        if (id !== currentVideo.id) {
          video.pause();
          video.currentTime = 0;
        }
      });

      videoEl.currentTime = 0;
      videoEl.muted = muted;
      videoEl.play().catch(() => {
        videoEl.muted = true;
        setMuted(true);
        videoEl.play().catch(console.error);
      });
    }
  }, [currentIndex, videos, muted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      const now = Date.now();
      if (now - lastInteraction.current < 300) return;
      lastInteraction.current = now;

      if (diff > 0 && videos && currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videos?.length) return;
      if (e.key === "ArrowUp" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === "ArrowDown" && currentIndex < videos.length - 1) {
        e.preventDefault();
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === "m" || e.key === "M") {
        setMuted(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, videos]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastInteraction.current < 300) return;
      lastInteraction.current = now;

      if (!videos?.length) return;
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [currentIndex, videos]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-xl font-bold">Loading Creator Feed...</div>
        </div>
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <Sparkles className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Content Yet</h2>
          <p className="text-gray-400">Be the first to upload!</p>
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
      data-testid="creator-feed"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideo.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {currentVideo.isPremium && !currentVideo.isLiked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/50 via-black/80 to-black">
              <div className="text-center p-8">
                <Lock className="w-20 h-20 text-pink-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Premium Content</h3>
                <p className="text-gray-400 mb-4">Unlock this exclusive content for {currentVideo.price} credits</p>
                <Button 
                  onClick={() => {
                    setSelectedVideo(currentVideo);
                    setShowUnlock(true);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  data-testid="button-unlock"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock for {currentVideo.price} Credits
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(currentVideo.id, el);
              }}
              src={currentVideo.videoUrl}
              poster={currentVideo.thumbnailUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={muted}
              onClick={() => {
                const video = videoRefs.current.get(currentVideo.id);
                if (video) {
                  if (video.paused) video.play();
                  else video.pause();
                }
              }}
              data-testid={`video-${currentVideo.id}`}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1 }}>
          <Avatar 
            className="w-12 h-12 ring-2 ring-pink-500 cursor-pointer"
            onClick={() => window.location.href = `/profile/${currentVideo.userId}`}
          >
            <AvatarImage src={currentVideo.userAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600">
              {currentVideo.username[0]}
            </AvatarFallback>
          </Avatar>
          {!followedUsers.has(currentVideo.userId) && !currentVideo.isFollowing ? (
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 -mt-3 bg-pink-500 rounded-full hover:bg-pink-600"
              onClick={() => handleFollow(currentVideo.userId)}
              data-testid="button-follow"
            >
              <UserPlus className="w-3 h-3 text-white" />
            </Button>
          ) : (
            <div className="w-6 h-6 -mt-3 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(currentVideo.id);
          }}
          data-testid="button-like"
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            likedVideos.has(currentVideo.id) || currentVideo.isLiked ? "bg-pink-500/30" : "bg-white/10"
          )}>
            <Heart className={cn(
              "w-7 h-7 transition-all",
              likedVideos.has(currentVideo.id) || currentVideo.isLiked 
                ? "fill-pink-500 text-pink-500 scale-110" 
                : "text-white"
            )} />
          </div>
          <span className="text-white text-xs mt-1">
            {currentVideo.likeCount + (likedVideos.has(currentVideo.id) && !currentVideo.isLiked ? 1 : 0)}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenComments(currentVideo);
          }}
          data-testid="button-comment"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{currentVideo.commentCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenGifts(currentVideo);
          }}
          data-testid="button-gift"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1">Sparks</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShare(currentVideo);
          }}
          data-testid="button-share"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{currentVideo.shareCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={() => setMuted(!muted)}
          data-testid="button-mute"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </div>
        </motion.button>
      </div>

      <div className="absolute left-4 bottom-24 right-20 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Avatar 
            className="w-10 h-10 ring-2 ring-white cursor-pointer"
            onClick={() => window.location.href = `/profile/${currentVideo.userId}`}
          >
            <AvatarImage src={currentVideo.userAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
              {currentVideo.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span 
                className="text-white font-bold text-base cursor-pointer hover:underline"
                onClick={() => window.location.href = `/profile/${currentVideo.userId}`}
              >
                @{currentVideo.username}
              </span>
              {currentVideo.isVerified && (
                <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">Verified</Badge>
              )}
              {currentVideo.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-1.5 py-0">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> VIP
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {!followedUsers.has(currentVideo.userId) && !currentVideo.isFollowing ? (
                <Button
                  size="sm"
                  className="h-6 px-3 text-xs bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                  onClick={() => handleFollow(currentVideo.userId)}
                  disabled={followMutation.isPending}
                  data-testid="button-follow-inline"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Follow
                </Button>
              ) : (
                <Badge className="bg-green-500/80 text-white text-[10px] px-2 py-0.5">
                  <Check className="w-2.5 h-2.5 mr-0.5" /> Following
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-white text-sm mb-2 line-clamp-2 mt-2">{currentVideo.description}</p>
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <span>{currentVideo.viewCount.toLocaleString()} views</span>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 z-30 pt-2 pb-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="w-8" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTabChange('live')}
              className={cn(
                "px-4 py-1.5 text-base font-semibold transition-colors",
                activeTab === 'live' ? "text-white" : "text-gray-400"
              )}
              data-testid="tab-live"
            >
              <span className="flex items-center gap-1">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                LIVE
              </span>
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setActiveTab('following')}
              className={cn(
                "px-4 py-1.5 text-base font-semibold transition-colors",
                activeTab === 'following' ? "text-white" : "text-gray-400"
              )}
              data-testid="tab-following"
            >
              Following
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setActiveTab('foryou')}
              className={cn(
                "px-4 py-1.5 text-base font-semibold transition-colors relative",
                activeTab === 'foryou' ? "text-white" : "text-gray-400"
              )}
              data-testid="tab-foryou"
            >
              For You
              {activeTab === 'foryou' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>
          <button
            onClick={() => window.location.href = '/search'}
            className="w-8 h-8 flex items-center justify-center"
            data-testid="button-search"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 bg-white/10 text-white rounded-full"
          onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          data-testid="button-prev"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
        <div className="text-white text-xs text-center py-1">
          {currentIndex + 1}/{videos.length}
          {feedData?.pagination?.total && (
            <div className="text-gray-500 text-[10px]">
              of {feedData.pagination.total.toLocaleString()}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 bg-white/10 text-white rounded-full"
          onClick={() => currentIndex < videos.length - 1 && setCurrentIndex(prev => prev + 1)}
          disabled={currentIndex === videos.length - 1}
          data-testid="button-next"
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>

      <Dialog open={showGifts} onOpenChange={setShowGifts}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Send a Gift</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 p-4">
            {VIRTUAL_GIFTS.map((gift) => (
              <motion.button
                key={gift.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                onClick={() => selectedVideo && sendGiftMutation.mutate({ videoId: selectedVideo.id, giftId: gift.id })}
                disabled={sendGiftMutation.isPending}
                data-testid={`gift-${gift.id}`}
              >
                <span className="text-3xl mb-1">{gift.icon}</span>
                <span className="text-white text-xs">{gift.name}</span>
                <span className="text-pink-400 text-xs font-bold">{gift.price}</span>
              </motion.button>
            ))}
          </div>
          <div className="text-center text-gray-400 text-sm pb-4">
            Your balance: <span className="text-pink-400 font-bold">{userCredits?.credits ?? 0}</span> credits
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnlock} onOpenChange={setShowUnlock}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Unlock Premium Content</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-white mb-2">Unlock this exclusive content from <span className="text-pink-400 font-bold">@{selectedVideo?.username}</span></p>
            <p className="text-gray-400 mb-6">Cost: <span className="text-pink-400 font-bold">{selectedVideo?.price}</span> credits</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300"
                onClick={() => setShowUnlock(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                onClick={() => selectedVideo && unlockMutation.mutate(selectedVideo.id)}
                disabled={unlockMutation.isPending}
                data-testid="button-confirm-unlock"
              >
                {unlockMutation.isPending ? "Unlocking..." : "Unlock Now"}
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Your balance: {userCredits?.credits ?? 0} credits
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Sheet */}
      <Sheet open={showComments} onOpenChange={setShowComments}>
        <SheetContent side="bottom" className="h-[70vh] bg-black/95 border-t border-gray-800 rounded-t-3xl">
          <SheetHeader className="border-b border-gray-800 pb-3">
            <SheetTitle className="text-white text-center">
              {comments.length} Comments
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-140px)] py-4">
            <div className="space-y-4 px-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">
                      {comment.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">@{comment.username}</span>
                      <span className="text-gray-500 text-xs">{comment.createdAt}</span>
                    </div>
                    <p className="text-gray-200 text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-gray-400 text-xs hover:text-pink-500">
                        <Heart className="w-4 h-4" />
                        {comment.likeCount}
                      </button>
                      <button className="text-gray-400 text-xs hover:text-white">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black/95">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">Y</AvatarFallback>
              </Avatar>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[40px] max-h-[80px] resize-none bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                data-testid="input-comment"
              />
              <Button
                size="icon"
                onClick={handlePostComment}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="bg-pink-500 hover:bg-pink-600"
                data-testid="button-post-comment"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Share Sheet */}
      <Sheet open={showShare} onOpenChange={setShowShare}>
        <SheetContent side="bottom" className="h-auto bg-black/95 border-t border-gray-800 rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white text-center">Share</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-5 gap-4 py-4">
            {SHARE_OPTIONS.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2"
                onClick={() => handleShareOption(option.id, selectedVideo)}
                data-testid={`share-${option.id}`}
              >
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", option.color)}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">{option.name}</span>
              </motion.button>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-4 pb-8">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <Link2 className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm flex-1 truncate">
                {selectedVideo ? `${window.location.origin}/video/${selectedVideo.id}` : ''}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-pink-400 hover:text-pink-300"
                onClick={() => handleShareOption('copy', selectedVideo)}
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
