/**
 * PROFITHACK AI - TikTok-Style Upload Interface
 * EXACT TikTok Upload Layout with Record, Effects, Sound
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Video as VideoIcon, 
  Image as ImageIcon, 
  Radio, 
  FileText, 
  Music, 
  X, 
  ArrowLeft,
  Sparkles,
  Mic
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type UploadType = 'photo' | 'reel' | 'video' | 'live' | 'text' | null;
type ReelDuration = 15 | 30 | 60 | 180 | 600; // seconds

const uploadSchema = z.object({
  title: z.string().min(1, "Title required").max(100),
  description: z.string().max(500).optional(),
  isAdultContent: z.boolean().default(false),
  hashtags: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function UploadVideoPage() {
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [reelDuration, setReelDuration] = useState<ReelDuration>(60);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [effectsIntensity, setEffectsIntensity] = useState([50]);
  const [showEffects, setShowEffects] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      isAdultContent: false,
      hashtags: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData & { videoFile?: File; imageFile?: File }) => {
      const formData = new FormData();
      
      if (data.videoFile) formData.append("videoFile", data.videoFile);
      if (data.imageFile) formData.append("imageFile", data.imageFile);
      
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("ageRating", data.isAdultContent ? "18plus" : "u16");
      formData.append("videoType", uploadType === 'reel' ? "short" : "long");
      formData.append("category", "general");
      formData.append("isPublic", "true");
      formData.append("isPremium", "false");
      
      if (data.hashtags) {
        const hashtagArray = data.hashtags.split(/\s+/).filter(tag => tag.startsWith('#'));
        formData.append("hashtags", JSON.stringify(hashtagArray));
      } else {
        formData.append("hashtags", JSON.stringify([]));
      }

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "✨ Content uploaded successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      handleReset();
    },
    onError: () => {
      toast({ title: "❌ Upload failed", variant: "destructive" });
    },
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (data: UploadFormData) => {
    if (uploadType === 'photo' && !imageFile) {
      toast({ title: "Please select a photo", variant: "destructive" });
      return;
    }
    if ((uploadType === 'reel' || uploadType === 'video') && !videoFile) {
      toast({ title: "Please select a video", variant: "destructive" });
      return;
    }
    uploadMutation.mutate({ ...data, videoFile: videoFile || undefined, imageFile: imageFile || undefined });
  };

  const handleReset = () => {
    setUploadType(null);
    setVideoFile(null);
    setImageFile(null);
    setVideoPreview(null);
    setImagePreview(null);
    setEffectsIntensity([50]);
    setShowEffects(false);
    form.reset();
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({ title: "🎬 Recording started!", description: "Tap to stop recording" });
    // TODO: Implement actual camera recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast({ title: "✅ Recording stopped" });
    // TODO: Save recorded video
  };

  // Selection screen - EXACT TikTok layout
  if (!uploadType) {
    return (
      <div className="h-screen bg-black flex flex-col">
        {/* Top bar with sound button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="text-white"
            data-testid="button-back"
          >
            <X className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-lg font-bold">Create</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white"
            data-testid="button-sound"
          >
            <Music className="w-6 h-6" />
          </Button>
        </div>

        {/* Content type options */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Photo */}
            <Card 
              className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setUploadType('photo')}
              data-testid="card-upload-photo"
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-pink-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Photo</h3>
                  <p className="text-white/60 text-sm">Upload an image</p>
                </div>
              </CardContent>
            </Card>

            {/* Reel */}
            <Card 
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setUploadType('reel')}
              data-testid="card-upload-reel"
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Reel</h3>
                  <p className="text-white/60 text-sm">15s - 10 mins</p>
                </div>
              </CardContent>
            </Card>

            {/* Full Video */}
            <Card 
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => setUploadType('video')}
              data-testid="card-upload-video"
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <VideoIcon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Full Video</h3>
                  <p className="text-white/60 text-sm">Upload long form</p>
                </div>
              </CardContent>
            </Card>

            {/* Go Live */}
            <Card 
              className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 hover-elevate active-elevate-2 cursor-pointer"
              onClick={() => {
                toast({ title: "🔴 Live streaming", description: "Coming soon!" });
                window.location.href = '/live';
              }}
              data-testid="card-upload-live"
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Go Live</h3>
                  <p className="text-white/60 text-sm">Stream now</p>
                </div>
              </CardContent>
            </Card>

            {/* Text Post */}
            <Card 
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover-elevate active-elevate-2 cursor-pointer col-span-2"
              onClick={() => setUploadType('text')}
              data-testid="card-upload-text"
            >
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Text Post</h3>
                  <p className="text-white/60 text-sm">Share your thoughts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Record button - EXACT TikTok style */}
        <div className="p-8 flex flex-col items-center gap-4 border-t border-white/10">
          <Button
            size="icon"
            className={cn(
              "w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-white shadow-2xl shadow-pink-500/50",
              isRecording && "animate-pulse"
            )}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            data-testid="button-record"
          >
            <Camera className="w-10 h-10 text-white" />
          </Button>
          <p className="text-white/80 text-sm">Tap to record</p>
          
          {/* Effects slider */}
          <Button
            variant="ghost"
            className="text-white flex items-center gap-2"
            onClick={() => setShowEffects(!showEffects)}
            data-testid="button-effects"
          >
            <Sparkles className="w-5 h-5" />
            <span>Effects</span>
          </Button>
          
          {showEffects && (
            <div className="w-full max-w-xs bg-black/80 p-4 rounded-lg backdrop-blur-xl border border-white/10">
              <p className="text-white/80 text-sm mb-2">Effect Intensity</p>
              <Slider
                value={effectsIntensity}
                onValueChange={setEffectsIntensity}
                max={100}
                step={1}
                className="w-full"
                data-testid="slider-effects"
              />
              <p className="text-white/60 text-xs mt-2 text-center">{effectsIntensity[0]}%</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Upload form screen - for reel duration selection and file upload
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleReset}
          className="text-white"
          data-testid="button-back-form"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-white text-lg font-bold">
          {uploadType === 'photo' && 'Upload Photo'}
          {uploadType === 'reel' && 'Upload Reel'}
          {uploadType === 'video' && 'Upload Video'}
          {uploadType === 'text' && 'Text Post'}
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white"
          data-testid="button-sound-form"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Reel duration selector */}
          {uploadType === 'reel' && (
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-3">Select duration</p>
              <div className="grid grid-cols-5 gap-2">
                {[15, 30, 60, 180, 600].map((duration) => (
                  <Button
                    key={duration}
                    variant={reelDuration === duration ? "default" : "outline"}
                    className={cn(
                      "h-12",
                      reelDuration === duration && "bg-gradient-to-r from-pink-500 to-purple-600"
                    )}
                    onClick={() => setReelDuration(duration as ReelDuration)}
                    data-testid={`button-duration-${duration}`}
                  >
                    {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* File upload */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Photo upload */}
              {uploadType === 'photo' && (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                  <Input
                    data-testid="input-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-96 rounded-lg" />
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-16 h-16 mx-auto text-white/40" />
                        <p className="text-white/60">Tap to upload photo</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Video upload */}
              {(uploadType === 'reel' || uploadType === 'video') && (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                  <Input
                    data-testid="input-video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {videoPreview ? (
                      <video src={videoPreview} controls className="mx-auto max-h-96 rounded-lg" />
                    ) : (
                      <div className="space-y-4">
                        <VideoIcon className="w-16 h-16 mx-auto text-white/40" />
                        <p className="text-white/60">Tap to upload video (9:16 recommended)</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Text post */}
              {uploadType === 'text' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    className="min-h-[200px] bg-white/5 border-white/20 text-white text-lg"
                    data-testid="input-text-content"
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Title</FormLabel>
                    <FormControl>
                      <Input 
                        data-testid="input-title" 
                        placeholder="Give it a catchy title..." 
                        {...field}
                        className="bg-white/5 border-white/20 text-white"
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
                    <FormLabel className="text-white/80">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        data-testid="input-description" 
                        placeholder="Tell your story..." 
                        {...field}
                        className="bg-white/5 border-white/20 text-white"
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
                    <FormLabel className="text-white/80">Hashtags</FormLabel>
                    <FormControl>
                      <Input 
                        data-testid="input-hashtags" 
                        placeholder="#trending #viral #fyp" 
                        {...field}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAdultContent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-white/20 p-4 bg-white/5">
                    <div>
                      <FormLabel className="text-white/80">Adult Content (18+)</FormLabel>
                      <p className="text-sm text-white/60">Age-restrict this content</p>
                    </div>
                    <FormControl>
                      <Switch
                        data-testid="switch-adult-content"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-upload"
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-lg"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Post"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
