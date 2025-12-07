import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Upload, Video, Image as ImageIcon, X, Plus, Lock, 
  DollarSign, Tag, Music, Sparkles, Eye, Crown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("50");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Upload Complete!", description: "Your video is now live" });
      queryClient.invalidateQueries({ queryKey: ['/api/creator-feed'] });
      window.location.href = '/feed';
    },
    onError: () => {
      toast({ title: "Upload Failed", description: "Please try again", variant: "destructive" });
      setIsUploading(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      toast({ title: "Invalid file", description: "Please select a video file", variant: "destructive" });
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 500MB", variant: "destructive" });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const addHashtag = () => {
    const tag = hashtagInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('videoFile', file);
    formData.append('title', title || 'Untitled');
    formData.append('description', description);
    formData.append('hashtags', JSON.stringify(hashtags));
    formData.append('isPremium', String(isPremium));
    formData.append('isPublic', 'true');
    formData.append('videoType', 'short');
    formData.append('ageRating', 'all');
    if (isPremium) {
      formData.append('price', price);
    }

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await uploadMutation.mutateAsync(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24" data-testid="creator-upload">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Upload className="w-7 h-7 text-pink-500" />
        Upload Content
      </h1>

      <div className="space-y-6">
        <Card 
          className={cn(
            "border-2 border-dashed p-8 text-center cursor-pointer transition-all",
            file 
              ? "border-pink-500 bg-pink-500/10" 
              : "border-white/20 bg-white/5 hover:border-white/40"
          )}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file"
          />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[9/16] max-w-[200px] mx-auto"
              >
                <video 
                  src={preview} 
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Video className="w-10 h-10 text-pink-500" />
                </div>
                <p className="text-white font-medium mb-1">Tap to upload video</p>
                <p className="text-gray-400 text-sm">MP4, MOV up to 500MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-400 mb-2 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title..."
              className="bg-white/5 border-white/10 text-white"
              maxLength={100}
              data-testid="input-title"
            />
          </div>

          <div>
            <Label className="text-gray-400 mb-2 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content..."
              className="bg-white/5 border-white/10 text-white resize-none"
              rows={3}
              maxLength={500}
              data-testid="input-description"
            />
          </div>

          <div>
            <Label className="text-gray-400 mb-2 block">Hashtags</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {hashtags.map((tag) => (
                <Badge 
                  key={tag}
                  className="bg-pink-500/20 text-pink-400 cursor-pointer hover:bg-pink-500/30"
                  onClick={() => removeHashtag(tag)}
                >
                  #{tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                placeholder="Add hashtag..."
                className="bg-white/5 border-white/10 text-white"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                data-testid="input-hashtag"
              />
              <Button
                variant="outline"
                className="border-white/10"
                onClick={addHashtag}
                disabled={hashtags.length >= 10}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Premium Content</p>
                  <p className="text-gray-400 text-sm">Subscribers only</p>
                </div>
              </div>
              <Switch
                checked={isPremium}
                onCheckedChange={setIsPremium}
                data-testid="switch-premium"
              />
            </div>

            <AnimatePresence>
              {isPremium && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <Label className="text-gray-400 mb-2 block">Unlock Price (credits)</Label>
                  <div className="flex gap-2">
                    {['25', '50', '100', '250', '500'].map((p) => (
                      <Button
                        key={p}
                        variant={price === p ? "default" : "outline"}
                        size="sm"
                        className={price === p ? "bg-yellow-500 text-black" : "border-white/10 text-white"}
                        onClick={() => setPrice(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {isPremium && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Earnings Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Price</p>
                  <p className="text-white font-bold">{price} credits</p>
                </div>
                <div>
                  <p className="text-gray-400">Your Earnings (55%)</p>
                  <p className="text-green-400 font-bold">{Math.floor(parseInt(price) * 0.55)} credits</p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-pink-400">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 py-6 text-lg"
            disabled={!file || isUploading}
            onClick={handleUpload}
            data-testid="button-upload"
          >
            {isUploading ? (
              <>Uploading... {uploadProgress}%</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Post Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
