import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Video,
  Image,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface UploadFormData {
  title: string;
  description: string;
  hashtags: string[];
  visibility: "public" | "unlisted" | "private";
  ageRating: "u16" | "16plus" | "18plus";
  category: string;
  isPremium: boolean;
  videoFile: File | null;
  thumbnailFile: File | null;
}

const categories = [
  "Gaming",
  "Music",
  "Education",
  "Entertainment",
  "Technology",
  "Sports",
  "Lifestyle",
  "Comedy",
  "Vlog",
  "Art",
  "Fitness",
  "Beauty",
  "Fashion",
  "Food",
  "Travel",
  "Adult",
  "Other",
];

export default function UploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    hashtags: [],
    visibility: "public",
    ageRating: "u16",
    category: "",
    isPremium: false,
    videoFile: null,
    thumbnailFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [currentTag, setCurrentTag] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      const formDataToSend = new FormData();
      
      if (!data.videoFile) {
        throw new Error("No video file selected");
      }

      formDataToSend.append("videoFile", data.videoFile);
      if (data.thumbnailFile) {
        formDataToSend.append("thumbnailFile", data.thumbnailFile);
      }
      formDataToSend.append("title", data.title);
      formDataToSend.append("description", data.description);
      formDataToSend.append("hashtags", JSON.stringify(data.hashtags));
      formDataToSend.append("videoType", "short");
      formDataToSend.append("ageRating", data.ageRating);
      formDataToSend.append("category", data.category);
      formDataToSend.append("isPremium", String(data.isPremium));
      formDataToSend.append("isPublic", String(data.visibility === "public"));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      try {
        const response = await fetch("/api/videos/upload", {
          method: "POST",
          body: formDataToSend,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/feed"] });
      toast({
        title: "Upload Complete! 🎉",
        description: "Your video is now live in the feed!",
      });
      setUploadStep(3);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
      setUploadProgress(0);
    },
  });

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 500MB limit
      if (file.size > 500 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Video must be less than 500MB",
        });
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setFormData((prev) => ({ ...prev, videoFile: file }));
      setUploadStep(2);
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreviewUrl(url);
      setFormData((prev) => ({ ...prev, thumbnailFile: file }));
    }
  };

  const handleAddTag = () => {
    if (
      currentTag.trim() &&
      !formData.hashtags.includes(currentTag.trim()) &&
      formData.hashtags.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoFile) {
      toast({
        variant: "destructive",
        title: "No Video",
        description: "Please select a video file",
      });
      return;
    }
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please enter a title for your video",
      });
      return;
    }

    setUploadProgress(0);
    uploadMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      hashtags: [],
      visibility: "public",
      ageRating: "u16",
      category: "",
      isPremium: false,
      videoFile: null,
      thumbnailFile: null,
    });
    setUploadStep(1);
    setUploadProgress(0);
    setVideoPreviewUrl("");
    setThumbnailPreviewUrl("");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Upload Video</h1>
              <p className="text-sm text-muted-foreground">
                Share your content with the world
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  uploadStep >= step
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {uploadStep > step ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className="text-xs mt-2 text-muted-foreground">
                {step === 1 && "Select"}
                {step === 2 && "Details"}
                {step === 3 && "Complete"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Step 1: Select Video */}
        {uploadStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div
                className="border-2 border-dashed rounded-lg p-12 hover-elevate transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Video size={64} className="mx-auto text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">
                  Select video to upload
                </h3>
                <p className="text-muted-foreground mb-6">
                  MP4, WebM, or MOV • Up to 500MB
                  <br />
                  Any length • Uploaded to your feed
                </p>
                <Button size="lg" data-testid="button-select-video">
                  <Upload size={20} className="mr-2" />
                  Select Video File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Video Details */}
        {uploadStep === 2 && formData.videoFile && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={48} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.videoFile.name} •{" "}
                  {(formData.videoFile.size / (1024 * 1024)).toFixed(1)}MB
                </p>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter a compelling title..."
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe your video..."
                    rows={3}
                    data-testid="textarea-description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Thumbnail (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {thumbnailPreviewUrl ? (
                        <img
                          src={thumbnailPreviewUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image size={24} className="text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                      data-testid="button-select-thumbnail"
                    >
                      <Image size={16} className="mr-2" />
                      {formData.thumbnailFile ? "Change" : "Select"} Thumbnail
                    </Button>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Hashtags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {formData.hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 pl-3 pr-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                    placeholder="Enter tag and press Enter..."
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddTag}
                    disabled={!currentTag.trim() || formData.hashtags.length >= 10}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 10 hashtags ({formData.hashtags.length}/10)
                </p>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visibility
                  </label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: "public" | "unlisted" | "private") =>
                      setFormData((prev) => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Rating */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium">Age Rating</p>
                          <p className="text-sm text-muted-foreground">
                            Content restriction level
                          </p>
                        </div>
                      </div>
                    </div>
                    <Select
                      value={formData.ageRating}
                      onValueChange={(value: "u16" | "16plus" | "18plus") =>
                        setFormData((prev) => ({ ...prev, ageRating: value }))
                      }
                    >
                      <SelectTrigger data-testid="select-age-rating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="u16">Under 16 (Family-friendly)</SelectItem>
                        <SelectItem value="16plus">16+ (Teen content)</SelectItem>
                        <SelectItem value="18plus">
                          18+ (Adult content) 🔞
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.ageRating === "18plus" && (
                      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={16} />
                          <p className="text-xs font-medium">
                            Age restriction enabled
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hidden from users under 18. Won't appear in general feed.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Premium Content Toggle */}
                {user?.subscriptionTier !== "explorer" && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Premium Content</p>
                        <p className="text-sm text-muted-foreground">
                          Only subscribers can view
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isPremium}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isPremium: checked }))
                      }
                      data-testid="switch-premium"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!formData.title.trim() || uploadMutation.isPending}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-semibold text-white"
                data-testid="button-submit"
              >
                {uploadMutation.isPending
                  ? `Uploading... ${uploadProgress}%`
                  : "🚀 Upload Video"}
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span className="font-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        )}

        {/* Step 3: Success */}
        {uploadStep === 3 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload Complete!</h3>
              <p className="text-muted-foreground mb-8">
                Your video is being processed and will be live shortly.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation("/videos")}
                  className="w-full"
                  size="lg"
                  data-testid="button-view-videos"
                >
                  View My Videos
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="w-full"
                  data-testid="button-upload-another"
                >
                  Upload Another Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
