import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "wouter";
import { 
  Heart, MessageCircle, Share2, Grid, Play, Crown, Sparkles, 
  UserPlus, UserCheck, Settings, Edit, Lock, Image as ImageIcon,
  DollarSign, Eye, TrendingUp, Star
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  isVerified: boolean;
  isVIP: boolean;
  followerCount: number;
  followingCount: number;
  likeCount: number;
  videoCount: number;
  isFollowing: boolean;
  isSubscribed: boolean;
  subscriptionPrice?: number;
  earnings?: number;
}

interface Video {
  id: string;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
  likeCount: number;
  isPremium: boolean;
  price?: number;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  color: string;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "fan",
    name: "Fan",
    price: 4.99,
    benefits: ["Access to exclusive posts", "Direct messaging", "Fan badge"],
    color: "from-blue-400 to-blue-600"
  },
  {
    id: "superfan",
    name: "Super Fan",
    price: 14.99,
    benefits: ["All Fan benefits", "Early access to content", "Exclusive live streams", "Priority replies"],
    color: "from-purple-400 to-purple-600"
  },
  {
    id: "vip",
    name: "VIP",
    price: 49.99,
    benefits: ["All Super Fan benefits", "Custom content requests", "1-on-1 video calls", "VIP badge", "Behind the scenes"],
    color: "from-yellow-400 to-orange-500"
  }
];

export default function CreatorProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const { toast } = useToast();

  const { data: creator, isLoading } = useQuery<Creator>({
    queryKey: ['/api/creators', userId],
    enabled: !!userId,
  });

  const { data: videos } = useQuery<Video[]>({
    queryKey: ['/api/creators', userId, 'videos'],
    enabled: !!userId,
  });

  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ['/api/user'],
  });

  const isOwnProfile = currentUser?.id === userId;

  const followMutation = useMutation({
    mutationFn: () => apiRequest(`/api/users/${userId}/follow`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creators', userId] });
      toast({ title: creator?.isFollowing ? "Unfollowed" : "Following!" });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (tierId: string) => apiRequest(`/api/creators/${userId}/subscribe`, "POST", { tierId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creators', userId] });
      toast({ title: "Subscribed!", description: "Thank you for your support!" });
      setShowSubscribe(false);
    },
    onError: () => {
      toast({ title: "Payment Failed", description: "Please try again", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Creator Not Found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20" data-testid="creator-profile">
      <div className="relative h-48 bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500">
        {creator.coverImage && (
          <img 
            src={creator.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative px-4 -mt-16">
        <div className="flex items-end gap-4">
          <Avatar className="w-28 h-28 ring-4 ring-black">
            <AvatarImage src={creator.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-3xl text-white">
              {creator.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{creator.displayName || creator.username}</h1>
              {creator.isVerified && (
                <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
              )}
              {creator.isVIP && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                  <Crown className="w-3 h-3 mr-1" /> VIP
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-sm">@{creator.username}</p>
          </div>
        </div>

        <p className="text-white mt-4 text-sm">{creator.bio || "No bio yet"}</p>

        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-white font-bold text-lg">{creator.followerCount.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{creator.followingCount.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{creator.likeCount.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">{creator.videoCount}</p>
            <p className="text-gray-400 text-xs">Videos</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {isOwnProfile ? (
            <>
              <Button 
                className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => window.location.href = '/edit-profile'}
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white"
                onClick={() => window.location.href = '/settings'}
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                className={cn(
                  "flex-1",
                  creator.isFollowing 
                    ? "bg-white/10 hover:bg-white/20 text-white" 
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                )}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                data-testid="button-follow"
              >
                {creator.isFollowing ? (
                  <><UserCheck className="w-4 h-4 mr-2" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                )}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                onClick={() => setShowSubscribe(true)}
                data-testid="button-subscribe"
              >
                <Crown className="w-4 h-4 mr-2" />
                {creator.isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => window.location.href = `/messages/${userId}`}
                data-testid="button-message"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {isOwnProfile && creator.earnings !== undefined && (
          <Card className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-green-400">${creator.earnings.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  <DollarSign className="w-4 h-4 mr-1" /> Withdraw
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-2 bg-black/30 rounded-lg">
                <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-white font-bold">12.5K</p>
                <p className="text-gray-400 text-xs">Views</p>
              </div>
              <div className="text-center p-2 bg-black/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-white font-bold">+24%</p>
                <p className="text-gray-400 text-xs">Growth</p>
              </div>
              <div className="text-center p-2 bg-black/30 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-white font-bold">156</p>
                <p className="text-gray-400 text-xs">Subscribers</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Tabs defaultValue="videos" className="mt-6">
        <TabsList className="w-full bg-transparent border-b border-white/10 rounded-none h-auto p-0">
          <TabsTrigger 
            value="videos" 
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none py-3"
          >
            <Grid className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="premium" 
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none py-3"
          >
            <Lock className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="liked" 
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none py-3"
          >
            <Heart className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-0">
          <div className="grid grid-cols-3 gap-0.5">
            {videos?.filter(v => !v.isPremium).map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 0.98 }}
                className="relative aspect-[9/16] bg-gray-900 cursor-pointer"
                onClick={() => window.location.href = `/video/${video.id}`}
                data-testid={`video-thumb-${video.id}`}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                  <Play className="w-3 h-3" />
                  {video.viewCount.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="mt-0">
          {creator.isSubscribed || isOwnProfile ? (
            <div className="grid grid-cols-3 gap-0.5">
              {videos?.filter(v => v.isPremium).map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 0.98 }}
                  className="relative aspect-[9/16] bg-gray-900 cursor-pointer"
                  onClick={() => window.location.href = `/video/${video.id}`}
                  data-testid={`premium-thumb-${video.id}`}
                >
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1">
                    <Badge className="bg-yellow-500 text-black text-xs">
                      <Crown className="w-3 h-3 mr-1" /> VIP
                    </Badge>
                  </div>
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 text-white text-xs">
                    <Play className="w-3 h-3" />
                    {video.viewCount.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Lock className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
              <p className="text-gray-400 mb-4">Subscribe to unlock exclusive content</p>
              <Button 
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                onClick={() => setShowSubscribe(true)}
              >
                Subscribe Now
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          <div className="p-8 text-center text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Liked videos are private</p>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSubscribe} onOpenChange={setShowSubscribe}>
        <DialogContent className="bg-black/95 border-pink-500/20 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-xl">Subscribe to @{creator.username}</DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Choose a subscription tier to support this creator
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-2">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <motion.div
                key={tier.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer border-2 transition-all",
                  selectedTier?.id === tier.id 
                    ? "border-pink-500 bg-pink-500/10" 
                    : "border-white/10 bg-white/5 hover:border-white/30"
                )}
                onClick={() => setSelectedTier(tier)}
                data-testid={`tier-${tier.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center", tier.color)}>
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{tier.name}</h4>
                      <p className="text-pink-400 font-bold">${tier.price}/mo</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedTier?.id === tier.id ? "border-pink-500 bg-pink-500" : "border-gray-600"
                  )}>
                    {selectedTier?.id === tier.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <ul className="space-y-1">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3 p-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
              onClick={() => setShowSubscribe(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={!selectedTier || subscribeMutation.isPending}
              onClick={() => selectedTier && subscribeMutation.mutate(selectedTier.id)}
              data-testid="button-confirm-subscribe"
            >
              {subscribeMutation.isPending ? "Processing..." : `Subscribe $${selectedTier?.price || 0}/mo`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
