import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Sparkles, 
  Video, 
  Code, 
  BarChart3, 
  Wand2, 
  Download,
  Play,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CreatorStudio() {
  const { toast } = useToast();
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("cinematic");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const generateVideoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/grpc/sora/generate", {
        method: "POST",
        body: {
          prompt: videoPrompt,
          style: videoStyle,
          duration: 5
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedVideo(data.videoUrl);
      toast({
        title: "Video Generated! 🎬",
        description: "Your AI-powered video is ready to download!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your video. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGenerate = () => {
    if (!videoPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a video prompt first.",
        variant: "destructive"
      });
      return;
    }
    generateVideoMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Creator Studio Pro
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Professional creator tools powered by AI - Video generation, code workspace, analytics
          </p>
          <div className="flex gap-4 flex-wrap">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Sparkles className="w-3 h-3 mr-1" />
              Sora 2 AI
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              <Code className="w-3 h-3 mr-1" />
              Code Workspace
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
              <BarChart3 className="w-3 h-3 mr-1" />
              Advanced Analytics
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Video Generator */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                AI Video Generator (Sora 2)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate stunning videos from text prompts using OpenAI's Sora 2
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Video Prompt</label>
                <Textarea
                  placeholder="Describe the video you want to create... (e.g., 'A cinematic drone shot flying over a futuristic neon city at night')"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="bg-white/5 border-white/20 text-white min-h-32"
                  data-testid="input-video-prompt"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Video Style</label>
                <Select value={videoStyle} onValueChange={setVideoStyle}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white" data-testid="select-video-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generateVideoMutation.isPending || !videoPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                data-testid="button-generate-video"
              >
                {generateVideoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Video (5 seconds)
                  </>
                )}
              </Button>

              {generatedVideo && (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm font-semibold mb-2">✅ Video Generated Successfully!</p>
                    <video 
                      src={generatedVideo}
                      controls
                      className="w-full rounded-lg"
                      data-testid="video-generated"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-white/20" data-testid="button-download-video">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/20" data-testid="button-post-video">
                      <Play className="w-4 h-4 mr-2" />
                      Post to Feed
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tools */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10 hover-elevate cursor-pointer" data-testid="card-code-workspace">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-cyan-500/20">
                    <Code className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white">Code Workspace</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Browser-based IDE with AI assistance
                </p>
                <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-400" data-testid="button-open-code">
                  Open Workspace
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover-elevate cursor-pointer" data-testid="card-analytics">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-pink-500/20">
                    <BarChart3 className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-white">Analytics</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Track views, engagement, revenue
                </p>
                <Button variant="outline" className="w-full border-pink-500/50 text-pink-400" data-testid="button-view-analytics">
                  View Stats
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover-elevate cursor-pointer" data-testid="card-video-library">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white">Video Library</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Manage all your created videos
                </p>
                <Button variant="outline" className="w-full border-purple-500/50 text-purple-400" data-testid="button-manage-videos">
                  Manage Videos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
