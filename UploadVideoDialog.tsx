import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertVideoSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

const uploadVideoFormSchema = insertVideoSchema
  .extend({
    title: z.string().min(1, "Title is required").max(200),
    hashtags: z.union([z.string(), z.array(z.string())]).optional(),
    videoFile: z.any().optional(),
    thumbnailFile: z.any().optional(),
  })
  .omit({
    userId: true,
    videoUrl: true,
    thumbnailUrl: true,
    moderationStatus: true,
  });

type UploadVideoFormData = z.infer<typeof uploadVideoFormSchema>;

interface UploadVideoDialogProps {
  trigger?: React.ReactNode;
}

export function UploadVideoDialog({ trigger }: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<UploadVideoFormData>({
    resolver: zodResolver(uploadVideoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      hashtags: [],
      videoType: "short",
      quality: "hd",
      category: "",
      ageRating: "u16",
      isPublic: true,
      isPremium: false,
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (data: UploadVideoFormData) => {
      setUploadProgress(10);
      
      // TODO: Upload video and thumbnail to object storage
      // For now, we'll use placeholder URLs
      const videoUrl = "https://example.com/video.mp4";
      const thumbnailUrl = "https://example.com/thumbnail.jpg";
      
      setUploadProgress(50);

      // Parse hashtags from comma-separated string
      const hashtagsArray = typeof data.hashtags === 'string' 
        ? data.hashtags.split(',').map(tag => tag.trim()).filter(Boolean)
        : data.hashtags || [];

      const videoData = {
        ...data,
        hashtags: hashtagsArray,
        videoUrl,
        thumbnailUrl,
      };

      setUploadProgress(75);
      const response = await apiRequest("POST", "/api/videos", videoData);
      setUploadProgress(100);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video uploaded!",
        description: "Your video has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/reels"] });
      form.reset();
      setUploadProgress(0);
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onSubmit = (data: UploadVideoFormData) => {
    uploadVideoMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg hover:opacity-90"
            data-testid="button-upload-video-trigger"
          >
            <Upload className="w-6 h-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Video</DialogTitle>
          <DialogDescription className="text-slate-400">
            Share your content with the community
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Give your video a catchy title"
                      className="bg-slate-950 border-slate-700 text-white"
                      data-testid="input-video-title"
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
                  <FormLabel className="text-slate-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Describe your video..."
                      className="bg-slate-950 border-slate-700 text-white resize-none"
                      rows={3}
                      data-testid="textarea-video-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Hashtags</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="gaming, tutorial, funny (comma-separated)"
                      className="bg-slate-950 border-slate-700 text-white"
                      data-testid="input-video-hashtags"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500 text-xs">
                    Separate hashtags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="videoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-slate-950 border-slate-700 text-white"
                          data-testid="select-video-type"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="short" className="text-white">
                          Short (60s max)
                        </SelectItem>
                        <SelectItem value="long" className="text-white">
                          Long
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Age Rating</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-slate-950 border-slate-700 text-white"
                          data-testid="select-age-rating"
                        >
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem value="u16" className="text-white">
                          U16 (Safe)
                        </SelectItem>
                        <SelectItem value="16plus" className="text-white">
                          16+
                        </SelectItem>
                        <SelectItem value="18plus" className="text-white">
                          18+
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Category</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g., gaming, education, vlog"
                      className="bg-slate-950 border-slate-700 text-white"
                      data-testid="input-video-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-slate-300">Video File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="video/*"
                  className="bg-slate-950 border-slate-700 text-white cursor-pointer"
                  data-testid="input-video-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    form.setValue("videoFile", file);
                  }}
                />
              </FormControl>
              <FormDescription className="text-slate-500 text-xs">
                MP4, WebM, or MOV format
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel className="text-slate-300">Thumbnail</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-slate-950 border-slate-700 text-white cursor-pointer"
                  data-testid="input-thumbnail-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    form.setValue("thumbnailFile", file);
                  }}
                />
              </FormControl>
              <FormDescription className="text-slate-500 text-xs">
                JPG or PNG format
              </FormDescription>
            </FormItem>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-slate-700 text-white hover:bg-slate-800"
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadVideoMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                data-testid="button-submit-upload"
              >
                {uploadVideoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
