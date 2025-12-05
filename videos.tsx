import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema } from "@shared/schema";
import type { Video } from "@shared/schema";
import { z } from "zod";
import { Upload, Play, Heart, Star, Flag, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";

const createVideoFormSchema = insertVideoSchema.extend({
  title: z.string().min(1, "Title is required"),
  videoUrl: z.string().url("Valid video URL is required"),
  ageRating: z.enum(["u16", "16plus", "18plus"]),
});

export default function Videos() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ageFilter, setAgeFilter] = useState<"u16" | "16plus" | "18plus">("u16");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const form = useForm<z.infer<typeof createVideoFormSchema>>({
    resolver: zodResolver(createVideoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      ageRating: "u16",
      hashtags: [],
      moderationStatus: "pending",
    },
  });

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos", ageFilter],
    queryFn: async () => {
      const response = await fetch(`/api/videos?ageRating=${ageFilter}`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createVideoFormSchema>) => {
      return await apiRequest("/api/videos", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Video uploaded",
        description:
          "Your video is pending moderation and will be live soon.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload video. Please try again.",
      });
    },
  });

  const getAgeRatingBadge = (rating: string) => {
    switch (rating) {
      case "u16":
        return <Badge variant="secondary">U16</Badge>;
      case "16plus":
        return <Badge variant="default">16+</Badge>;
      case "18plus":
        return <Badge variant="destructive">18+</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Videos</h1>
          <p className="text-muted-foreground">
            Discover and share creative content
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="button-upload-video"
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Video</DialogTitle>
              <DialogDescription>
                Share your 9:16 content with the CreatorVerse community
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createVideoMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My awesome video"
                          data-testid="input-video-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell viewers about your video"
                          data-testid="input-video-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://storage.example.com/video.mp4"
                          data-testid="input-video-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://storage.example.com/thumb.jpg"
                          data-testid="input-thumbnail-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Rating</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-age-rating">
                            <SelectValue placeholder="Select age rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="u16">U16 - Safe for all</SelectItem>
                          <SelectItem value="16plus">
                            16+ - Mature themes
                          </SelectItem>
                          <SelectItem value="18plus">
                            18+ - Adults only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    data-testid="button-submit-video"
                    disabled={createVideoMutation.isPending}
                  >
                    {createVideoMutation.isPending
                      ? "Uploading..."
                      : "Upload Video"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={ageFilter} onValueChange={(v) => setAgeFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="u16" data-testid="tab-u16">
            U16
          </TabsTrigger>
          <TabsTrigger value="16plus" data-testid="tab-16plus">
            16+
          </TabsTrigger>
          <TabsTrigger value="18plus" data-testid="tab-18plus">
            18+
          </TabsTrigger>
        </TabsList>

        <TabsContent value={ageFilter} className="mt-6">
          {videos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Play className="w-8 h-8 text-pink-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No videos yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Be the first to upload content in this category!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden hover-elevate cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                  data-testid={`card-video-${video.id}`}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-[9/16] bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div className="absolute top-2 right-2">
                        {getAgeRatingBadge(video.ageRating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {video.giftCount}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-flag-${video.id}`}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
