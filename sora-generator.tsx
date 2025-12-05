import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Film, 
  Zap,
  Clock,
  Wand2,
  Play,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const VIDEO_STYLES = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'realistic', label: 'Realistic' },
  { value: '3d', label: '3D Animation' },
  { value: 'pixar', label: 'Pixar Style' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'documentary', label: 'Documentary' }
];

const VIDEO_DURATIONS = [
  { value: '2', label: '2 seconds', credits: 50 },
  { value: '4', label: '4 seconds', credits: 100 },
  { value: '6', label: '6 seconds', credits: 150 },
  { value: '10', label: '10 seconds', credits: 250 }
];

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Classic)' }
];

export default function SoraGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'text' | 'image' | 'video'>('text');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('4');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/sora/generate', 'POST', data) as any;
    },
    onSuccess: (data: any) => {
      setGeneratedVideo(data.videoUrl);
      toast({
        title: "✨ Video Generated!",
        description: `Your ${duration}s video is ready!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Oops!",
        description: error.message || "Failed to generate video. Check your credits.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    const selectedDuration = VIDEO_DURATIONS.find(d => d.value === duration);
    
    if (!prompt) {
      toast({
        title: "Missing Prompt",
        description: "Please describe what you want to create.",
        variant: "destructive",
      });
      return;
    }

    if (mode !== 'text' && !sourceFile) {
      toast({
        title: "Missing File",
        description: `Please upload ${mode === 'image' ? 'an image' : 'a video'}.`,
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      mode,
      prompt,
      style,
      duration: parseInt(duration),
      aspectRatio,
      sourceFile: sourceFile?.name,
      credits: selectedDuration?.credits || 100
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (mode === 'image' && !isImage) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      
      if (mode === 'video' && !isVideo) {
        toast({
          title: "Invalid File",
          description: "Please upload a video file.",
          variant: "destructive",
        });
        return;
      }
      
      setSourceFile(file);
    }
  };

  const selectedDuration = VIDEO_DURATIONS.find(d => d.value === duration);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 p-4" data-testid="container-sora-generator">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sora 2 Video Generator</h1>
              <p className="text-muted-foreground">Create stunning AI videos from text, images, or video</p>
            </div>
          </div>

          <Badge className="gap-2 text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500">
            <Zap className="w-4 h-4" />
            {selectedDuration?.credits} credits
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card data-testid="card-generation-mode">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generation Mode
                </CardTitle>
                <CardDescription>Choose how you want to create your video</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="gap-2" data-testid="tab-text-to-video">
                      <Video className="w-4 h-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-2" data-testid="tab-image-to-video">
                      <ImageIcon className="w-4 h-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="gap-2" data-testid="tab-video-to-video">
                      <Film className="w-4 h-4" />
                      Video
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-500" />
                        Text-to-Video
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Describe your vision and Sora 2 will create a video from scratch. Perfect for bringing ideas to life!
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 mt-4">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        Image-to-Video
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Upload an image and describe how it should come to life. Great for animating photos!
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="image-upload">Upload Image</Label>
                      <Input 
                        id="image-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-2"
                        data-testid="input-image-upload"
                      />
                      {sourceFile && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {sourceFile.name}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-4 mt-4">
                    <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Film className="w-4 h-4 text-pink-500" />
                        Video-to-Video
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Upload a video and transform it with AI. Change style, add effects, or remix completely!
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="video-upload">Upload Video</Label>
                      <Input 
                        id="video-upload"
                        type="file" 
                        accept="video/*"
                        onChange={handleFileChange}
                        className="mt-2"
                        data-testid="input-video-upload"
                      />
                      {sourceFile && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {sourceFile.name}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card data-testid="card-prompt">
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>
                  {mode === 'text' 
                    ? "Describe what you want to see in the video"
                    : mode === 'image'
                    ? "Describe how the image should animate"
                    : "Describe how to transform the video"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={
                    mode === 'text'
                      ? "A majestic lion walking through a futuristic city, neon lights reflecting in puddles, cinematic camera movement..."
                      : mode === 'image'
                      ? "The person starts walking forward, camera follows smoothly, dramatic lighting..."
                      : "Transform into anime style, add dynamic camera movements, enhance colors..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                  data-testid="textarea-prompt"
                />
              </CardContent>
            </Card>

            <Card data-testid="card-settings">
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="mt-2" data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STYLES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="mt-2" data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label} - {d.credits} credits
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-2" data-testid="select-aspect-ratio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ar) => (
                        <SelectItem key={ar.value} value={ar.value}>
                          {ar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-lg py-6"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Video ({selectedDuration?.credits} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="h-full" data-testid="card-preview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generateMutation.isPending ? (
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
                    <div className="text-center">
                      <p className="font-semibold text-lg">Generating your video...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This usually takes 30-60 seconds
                      </p>
                    </div>
                  </div>
                ) : generatedVideo ? (
                  <div className="space-y-4">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full rounded-lg"
                      data-testid="video-preview"
                    />
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2" data-testid="button-download">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button className="flex-1 gap-2" variant="outline" onClick={() => setGeneratedVideo(null)} data-testid="button-generate-another">
                        <Sparkles className="w-4 h-4" />
                        Generate Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex flex-col items-center justify-center text-center p-8">
                    <Video className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="font-semibold text-lg mb-2">Your video will appear here</p>
                    <p className="text-sm text-muted-foreground">
                      Configure your settings and click "Generate Video" to create your masterpiece
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20" data-testid="card-tips">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-cyan-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Be specific about camera movements (pan, zoom, orbit)</p>
                <p>• Describe lighting conditions (golden hour, neon, dramatic)</p>
                <p>• Mention texture and material details for realism</p>
                <p>• For image-to-video: start with high-quality images</p>
                <p>• For video-to-video: source video quality affects output</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
