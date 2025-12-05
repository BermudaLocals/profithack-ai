import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Music, Play, Pause, Volume2, VolumeX, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPostProps {
  id: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  profileImage: string;
  username: string;
  userId: string;
  songName?: string;
  hashtags?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onUserClick?: () => void;
  onVideoClick?: () => void;
  autoPlay?: boolean;
  isActive?: boolean;
}

export function VideoPost({
  id,
  caption,
  videoUrl,
  thumbnailUrl,
  profileImage,
  username,
  userId,
  songName,
  hashtags = [],
  likeCount,
  commentCount,
  shareCount,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onUserClick,
  onVideoClick,
  autoPlay = false,
  isActive = false,
}: VideoPostProps) {
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(true);
  const [isHover, setIsHover] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(likeCount);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && autoPlay) {
        videoRef.current.play().catch(() => {
          videoRef.current!.muted = true;
          videoRef.current!.play().catch(console.error);
        });
        setPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setPlaying(false);
      }
    }
  }, [isActive, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  return (
    <div className="relative w-full h-full bg-black" data-testid={`video-post-${id}`}>
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          muted={muted}
          preload="metadata"
          data-testid={`video-element-${id}`}
        />

        {isHover && (
          <div className="absolute bottom-20 left-4 flex gap-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              data-testid="button-play-pause"
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              data-testid="button-mute"
            >
              {muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>
          </div>
        )}
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={handleLike}
          data-testid="button-like"
        >
          <div className={cn(
            "w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center",
            liked && "bg-pink-500/20"
          )}>
            <Heart className={cn("w-7 h-7", liked ? "fill-pink-500 text-pink-500" : "text-white")} />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">{likes}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={onComment}
          data-testid="button-comment"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">{commentCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={handleBookmark}
          data-testid="button-bookmark"
        >
          <div className={cn(
            "w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center",
            bookmarked && "bg-yellow-500/20"
          )}>
            <Bookmark className={cn("w-7 h-7", bookmarked ? "fill-yellow-500 text-yellow-500" : "text-white")} />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center"
          onClick={onShare}
          data-testid="button-share"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">{shareCount}</span>
        </motion.button>

        <motion.div
          animate={{ rotate: playing ? 360 : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mt-2"
        >
          <Avatar className="w-10 h-10 border-2 border-white/50" onClick={onUserClick}>
            <AvatarImage src={profileImage} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
        </motion.div>
      </div>

      <div className="absolute left-4 bottom-24 right-20 z-10">
        <div className="flex items-center gap-2 mb-2" onClick={onUserClick}>
          <span className="text-white font-bold text-base">@{username}</span>
          <BadgeCheck className="w-4 h-4 text-blue-400" />
          <Button variant="outline" size="sm" className="ml-2 h-7 text-xs border-pink-500 text-pink-500 hover:bg-pink-500/10">
            Follow
          </Button>
        </div>

        <p className="text-white text-sm mb-2 line-clamp-2">{caption}</p>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {hashtags.slice(0, 5).map((tag, i) => (
              <span key={i} className="text-white/80 text-xs font-medium">#{tag}</span>
            ))}
          </div>
        )}

        {songName && (
          <div className="flex items-center gap-2">
            <Music className={cn("w-4 h-4 text-white", playing && "animate-bounce")} />
            <div className="overflow-hidden max-w-[200px]">
              <p className="text-white text-xs whitespace-nowrap animate-marquee">{songName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPost;
