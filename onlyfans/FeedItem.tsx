import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Lock, DollarSign, Image as ImageIcon, FileText, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedItemProps {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  content: string;
  images?: string[];
  videos?: string[];
  files?: { name: string; url: string }[];
  isPaid?: boolean;
  price?: number;
  isUnlocked?: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timestamp: Date;
  isLiked?: boolean;
  isOwner?: boolean;
  onLike?: () => void;
  onComment?: (text: string) => void;
  onShare?: () => void;
  onUnlock?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FeedItem({
  id,
  userId,
  username,
  userAvatar,
  isVerified = false,
  content,
  images = [],
  videos = [],
  files = [],
  isPaid = false,
  price = 0,
  isUnlocked = false,
  likeCount,
  commentCount,
  shareCount,
  timestamp,
  isLiked = false,
  isOwner = false,
  onLike,
  onComment,
  onShare,
  onUnlock,
  onEdit,
  onDelete,
}: FeedItemProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment?.(commentText);
      setCommentText("");
    }
  };

  const canViewContent = !isPaid || isUnlocked || isOwner;

  return (
    <Card className="bg-black/40 border-white/10 overflow-hidden" data-testid={`feed-item-${id}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-pink-500/50">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                {username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{username}</span>
                {isVerified && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0">
                    VIP
                  </Badge>
                )}
              </div>
              <span className="text-white/50 text-sm">@{username.toLowerCase()}</span>
              <span className="text-white/30 text-sm ml-2">{formatTime(timestamp)}</span>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" data-testid="button-more-options">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 border-white/10">
                <DropdownMenuItem onClick={onEdit} className="text-white hover:bg-white/10" data-testid="button-edit">
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:bg-red-500/10" data-testid="button-delete">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-4">
          {canViewContent ? (
            <>
              <p className="text-white whitespace-pre-wrap break-words mb-4">{content}</p>

              {images.length > 0 && (
                <div className={cn(
                  "grid gap-2 mb-4",
                  images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"
                )}>
                  {images.map((image, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt="" 
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        data-testid={`feed-image-${id}-${i}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <div className="space-y-2 mb-4">
                  {videos.map((video, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden bg-black">
                      <video 
                        src={video} 
                        controls 
                        className="w-full"
                        data-testid={`feed-video-${id}-${i}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="space-y-2 mb-4">
                  {files.map((file, i) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      data-testid={`feed-file-${id}-${i}`}
                    >
                      <FileText className="w-8 h-8 text-pink-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <p className="text-white/50 text-sm">Click to download</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10 flex items-center justify-center">
                <Button 
                  onClick={onUnlock}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  data-testid="button-unlock"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock for ${price}
                </Button>
              </div>
              <div className="blur-xl opacity-50">
                <p className="text-white">{content.substring(0, 100)}...</p>
                {images.length > 0 && (
                  <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center mt-2">
                    <ImageIcon className="w-12 h-12 text-white/30" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isPaid && !isOwner && (
          <div className="flex items-center gap-2 mt-2 mb-4">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">Premium content - VIP subscribers only</span>
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white/70 hover:text-pink-400 transition-colors"
            onClick={handleLike}
            data-testid="button-like"
          >
            <Heart className={cn("w-5 h-5", liked && "fill-pink-500 text-pink-500")} />
            <span className="text-sm">{likes}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white/70 hover:text-blue-400 transition-colors"
            onClick={() => setShowComments(!showComments)}
            data-testid="button-toggle-comments"
          >
            <MessageCircle className={cn("w-5 h-5", showComments && "text-blue-400")} />
            <span className="text-sm">{commentCount}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white/70 hover:text-green-400 transition-colors"
            onClick={onShare}
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{shareCount}</span>
          </motion.button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex gap-2 mb-4">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="bg-white/5 border-white/10 text-white resize-none"
                maxLength={200}
                data-testid="input-comment"
              />
              <Button 
                onClick={handleSubmitComment}
                className="bg-pink-500 hover:bg-pink-600"
                data-testid="button-submit-comment"
              >
                Send
              </Button>
            </div>

            <div className="space-y-3">
              {comments.map((comment, i) => (
                <div key={i} className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.username?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-white/5 rounded-lg p-2">
                    <p className="text-white text-sm font-medium">{comment.username}</p>
                    <p className="text-white/70 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default FeedItem;
