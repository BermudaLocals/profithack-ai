import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Upload, Search, Loader2, Play, Gift } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

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
  viewCount: number;
  likeCount: number;
  commentCount: number;
  giftCount?: number;
  createdAt: string;
  user?: {
    username: string;
    profileImageUrl: string;
  };
};

export default function Tube() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos/tube"],
  });

  const filteredVideos = videos?.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-videos"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              data-testid="button-upload-video"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover-elevate cursor-pointer overflow-hidden" data-testid={`card-video-${video.id}`}>
                <div className="relative aspect-video bg-muted">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/10 to-purple-600/10">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                  </div>
                  {/* Quality Badge */}
                  <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
                    {video.quality}
                  </div>
                </div>

                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {video.user?.username?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2" data-testid={`title-${video.id}`}>
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1" data-testid={`username-${video.id}`}>
                        @{video.user?.username || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{video.viewCount.toLocaleString()} views</span>
                        <span>•</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Stats */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          toast({
                            title: "Sign in required",
                            description: "Please sign in to like videos",
                            variant: "destructive",
                          });
                          return;
                        }
                        const newLikedVideos = new Set(likedVideos);
                        if (newLikedVideos.has(video.id)) {
                          newLikedVideos.delete(video.id);
                        } else {
                          newLikedVideos.add(video.id);
                        }
                        setLikedVideos(newLikedVideos);
                        toast({
                          title: newLikedVideos.has(video.id) ? "Liked! ❤️" : "Unliked",
                          description: newLikedVideos.has(video.id) ? "Added to your favorites" : "Removed from favorites",
                        });
                      }}
                      className="flex items-center gap-1 text-xs hover-elevate active-elevate-2 px-2 py-1 rounded"
                      data-testid={`button-like-${video.id}`}
                    >
                      <Heart className={`w-4 h-4 ${likedVideos.has(video.id) ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'}`} />
                      <span className={likedVideos.has(video.id) ? 'text-pink-500 font-semibold' : 'text-muted-foreground'}>{video.likeCount}</span>
                    </button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{video.commentCount}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Send a Gift! 🎁",
                          description: "Gift feature coming soon - support your favorite creators!",
                        });
                      }}
                      className="flex items-center gap-1 text-xs hover-elevate active-elevate-2 px-2 py-1 rounded"
                      data-testid={`button-gift-${video.id}`}
                    >
                      <Gift className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 font-semibold">{video.giftCount || 0}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-semibold mb-2">No videos found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try a different search" : "Be the first to upload!"}
            </p>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              data-testid="button-upload-first"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
