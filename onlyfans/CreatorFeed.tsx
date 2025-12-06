/**
 * PROFITHACK AI - OnlyFans Core Module
 * Based on OnlyFans Clone Feed.js reference
 * Adapted for React + TypeScript + PostgreSQL
 * Features: VIP content, subscriptions, tips, private shows
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Image, FileText, Lock, DollarSign, Heart, MessageCircle, 
  Share2, Flame, Crown, Star, Gift, Video, Eye, Clock,
  ChevronDown, Send, Paperclip
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Creator {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  verified: boolean;
  subscriptionPrice: number;
  subscriberCount: number;
}

interface FeedPost {
  id: string;
  text: string;
  vipOnly: boolean;
  photos?: { cover: string; origin: string }[];
  files?: { url: string; name: string }[];
  videos?: { url: string; thumbnail: string }[];
  user: Creator;
  fromGroup?: { id: string; title: string };
  shareCount: number;
  commentCount: number;
  likeCount: number;
  tipAmount: number;
  createdAt: string;
  isLocked: boolean;
}

interface HotGroup {
  id: string;
  cover: string;
  title: string;
  memberCount: number;
}

// User Card Component - from reference UserCard
function UserCard({ creator }: { creator?: Creator }) {
  const { user } = useAuth();
  
  if (!creator && !user) return null;
  
  const displayUser = creator || user;
  
  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={(displayUser as any)?.avatar || (displayUser as any)?.profileImage} />
          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl">
            {(displayUser as any)?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold">{(displayUser as any)?.nickname || (displayUser as any)?.displayName}</h3>
            {(displayUser as any)?.verified && (
              <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
            )}
          </div>
          <p className="text-gray-400 text-sm">@{(displayUser as any)?.username}</p>
        </div>
      </div>
      
      {creator && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-pink-500 font-bold">{creator.subscriberCount}</p>
            <p className="text-gray-400 text-xs">Subscribers</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <p className="text-cyan-500 font-bold">${creator.subscriptionPrice}/mo</p>
            <p className="text-gray-400 text-xs">Subscribe</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Publish Box - from reference publishbox
function PublishBox({ onPublish }: { onPublish: (post: { text: string; vipOnly: boolean }) => void }) {
  const [text, setText] = useState("");
  const [vipOnly, setVipOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    await onPublish({ text, vipOnly });
    setText("");
    setIsSubmitting(false);
  };

  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800 mb-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? Share something with your fans..."
        className="bg-gray-800 border-gray-700 text-white mb-3 min-h-[80px] resize-none"
        data-testid="publish-textarea"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-pink-500 transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-pink-500 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-pink-500 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={vipOnly}
              onCheckedChange={setVipOnly}
              data-testid="vip-toggle"
            />
            <span className={cn(
              "text-sm",
              vipOnly ? "text-pink-500" : "text-gray-500"
            )}>
              <Lock className="w-4 h-4 inline mr-1" />
              VIP Only
            </span>
          </div>
          
          <Button 
            onClick={handlePublish}
            disabled={!text.trim() || isSubmitting}
            className="bg-pink-500 hover:bg-pink-600"
            data-testid="publish-btn"
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Feed Post Component - from reference feedlist item
function FeedPostCard({ 
  post, 
  onLike, 
  onComment, 
  onTip,
  onSubscribe 
}: { 
  post: FeedPost;
  onLike: () => void;
  onComment: () => void;
  onTip: () => void;
  onSubscribe: () => void;
}) {
  const [, navigate] = useLocation();

  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden mb-4">
      {/* Post Header - from reference */}
      <div className="p-4 flex items-start gap-3">
        <button onClick={() => navigate(`/creator/${post.user.username}`)}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              {post.user.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/creator/${post.user.username}`)}
              className="text-white font-bold hover:underline"
            >
              {post.user.nickname}
            </button>
            {post.user.verified && (
              <Badge className="bg-blue-500 text-white text-xs">
                <Crown className="w-3 h-3" />
              </Badge>
            )}
            <span className="text-gray-500 text-sm">@{post.user.username}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            {post.fromGroup && (
              <>
                <span>·</span>
                <button 
                  onClick={() => navigate(`/group/${post.fromGroup?.id}`)}
                  className="hover:text-pink-500"
                >
                  {post.fromGroup.title}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* VIP Badge - from reference */}
        {post.vipOnly && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <DollarSign className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        )}
      </div>
      
      {/* Post Content - from reference feedcontent */}
      <div className="px-4 pb-4">
        {/* Text Content */}
        {post.isLocked ? (
          <div className="bg-gray-800/50 rounded-lg p-6 text-center mb-4">
            <Lock className="w-10 h-10 text-pink-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">Subscribe to unlock this content</p>
            <Button 
              onClick={onSubscribe}
              className="bg-pink-500 hover:bg-pink-600"
              data-testid="subscribe-btn"
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe ${post.user.subscriptionPrice}/month
            </Button>
          </div>
        ) : (
          <>
            <p className="text-white mb-4">{post.text}</p>
            
            {/* Photos - from reference */}
            {post.photos && post.photos.length > 0 && (
              <div className={cn(
                "grid gap-2 mb-4",
                post.photos.length === 1 ? "grid-cols-1" : 
                post.photos.length === 2 ? "grid-cols-2" :
                "grid-cols-3"
              )}>
                {post.photos.map((photo, idx) => (
                  <a 
                    key={idx}
                    href={photo.origin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={photo.cover}
                      alt="Post media"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </a>
                ))}
              </div>
            )}
            
            {/* Videos */}
            {post.videos && post.videos.length > 0 && (
              <div className="space-y-2 mb-4">
                {post.videos.map((video, idx) => (
                  <video 
                    key={idx}
                    src={video.url}
                    poster={video.thumbnail}
                    controls
                    className="w-full rounded-lg"
                  />
                ))}
              </div>
            )}
            
            {/* Files - from reference */}
            {post.files && post.files.length > 0 && (
              <div className="space-y-2 mb-4">
                {post.files.map((file, idx) => (
                  <a 
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{file.name}</span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Action Bar - from reference actionbar */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onLike}
            className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors"
            data-testid={`like-${post.id}`}
          >
            <Heart className="w-5 h-5" />
            {post.likeCount > 0 && <span>{post.likeCount}</span>}
          </button>
          <button 
            onClick={onComment}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            data-testid={`comment-${post.id}`}
          >
            <MessageCircle className="w-5 h-5" />
            {post.commentCount > 0 && <span>{post.commentCount}</span>}
          </button>
          <button 
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-500 transition-colors"
            data-testid={`share-${post.id}`}
          >
            <Share2 className="w-5 h-5" />
            {post.shareCount > 0 && <span>{post.shareCount}</span>}
          </button>
        </div>
        
        {/* Tip Button */}
        <Button 
          onClick={onTip}
          size="sm"
          variant="outline"
          className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
          data-testid={`tip-${post.id}`}
        >
          <Gift className="w-4 h-4 mr-2" />
          Send Tip
        </Button>
      </div>
    </Card>
  );
}

// Hot Groups - from reference promogroup
function HotGroups({ groups }: { groups: HotGroup[] }) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <h2 className="text-white font-bold mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        Hot Creators
      </h2>
      <div className="space-y-3">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => navigate(`/group/${group.id}`)}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <img 
              src={group.cover} 
              alt={group.title}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">{group.title}</p>
              <p className="text-gray-500 text-xs">{group.memberCount} members</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// Main Creator Feed Component - from reference Feed
export function CreatorFeed() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<'hot' | 'all' | 'vip' | 'media'>('all');

  // Check auth - from reference componentWillMount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch feeds
  const { data: feeds = [] } = useQuery<FeedPost[]>({
    queryKey: ['/api/creator/feeds', filter],
  });

  // Fetch hot groups
  const { data: hotGroups = [] } = useQuery<HotGroup[]>({
    queryKey: ['/api/creator/hot-groups'],
  });

  // Fetch new feed count
  const { data: newFeedCount = 0 } = useQuery<number>({
    queryKey: ['/api/creator/new-feed-count'],
    refetchInterval: 30000,
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (post: { text: string; vipOnly: boolean }) => 
      apiRequest('/api/creator/posts', "POST", post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/feeds'] });
      toast({ title: "Post published!" });
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => 
      apiRequest(`/api/creator/posts/${postId}/like`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/feeds'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-pink-950/20 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - from reference leftside */}
          <div className="hidden lg:block space-y-4">
            <UserCard />
          </div>
          
          {/* Main Feed - from reference main */}
          <div className="lg:col-span-2">
            {/* Publish Box */}
            <PublishBox onPublish={(post) => publishMutation.mutate(post)} />
            
            {/* Feed Filter - from reference feedfilter */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-800 pb-4">
              <button
                onClick={() => setFilter('hot')}
                className={cn(
                  "text-sm font-medium transition-colors",
                  filter === 'hot' ? "text-pink-500" : "text-gray-400"
                )}
              >
                <Flame className="w-4 h-4 inline mr-1" />
                Hot
              </button>
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "text-sm font-medium transition-colors",
                  filter === 'all' ? "text-pink-500" : "text-gray-400"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('vip')}
                className={cn(
                  "text-sm font-medium transition-colors",
                  filter === 'vip' ? "text-pink-500" : "text-gray-400"
                )}
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                VIP
              </button>
              <button
                onClick={() => setFilter('media')}
                className={cn(
                  "text-sm font-medium transition-colors",
                  filter === 'media' ? "text-pink-500" : "text-gray-400"
                )}
              >
                <Image className="w-4 h-4 inline mr-1" />
                Media
              </button>
            </div>
            
            {/* New Feed Count - from reference newfeed */}
            {newFeedCount > 0 && (
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/creator/feeds'] })}
                className="w-full p-3 mb-4 bg-pink-500/20 text-pink-500 rounded-lg text-center hover:bg-pink-500/30 transition-colors"
              >
                {newFeedCount} new posts - Click to refresh
              </button>
            )}
            
            {/* Feed List - from reference feedlist */}
            {feeds.length > 0 ? (
              feeds.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onLike={() => likeMutation.mutate(post.id)}
                  onComment={() => toast({ title: "Comments coming soon!" })}
                  onTip={() => toast({ title: "Tip feature coming soon!" })}
                  onSubscribe={() => navigate(`/subscribe/${post.user.username}`)}
                />
              ))
            ) : (
              <Card className="p-8 bg-gray-900/50 border-gray-800 text-center">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No posts yet. Be the first to share!</p>
              </Card>
            )}
          </div>
          
          {/* Right Sidebar - from reference rightside */}
          <div className="hidden lg:block space-y-4">
            <HotGroups groups={hotGroups} />
            
            <div className="text-center text-gray-500 text-xs">
              © 2025 PROFITHACK AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorFeed;
