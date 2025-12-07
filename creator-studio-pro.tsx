import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Sparkles,
  Video,
  Mic,
  User,
  Wand2,
  Play,
  Download,
  Share2,
  Settings,
  TrendingUp,
  Zap,
  Crown,
  ChevronRight,
  Check,
  Upload,
  Image as ImageIcon,
  Music2,
  Type,
  Palette,
  BarChart3,
  Clock,
  DollarSign,
  Camera,
  MessageCircle,
  Phone,
  Bell,
  Wrench,
} from "lucide-react";
import type { CaptionStyle, AiVoice, ViralTemplate } from "@shared/schema";

export default function CreatorStudioPro() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"video" | "voice" | "influencer">("video");
  
  // Video Generator State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState("");
  const [videoDuration, setVideoDuration] = useState([30]);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  
  // Voice Cloner State
  const [voiceText, setVoiceText] = useState("");
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [clonedVoiceName, setClonedVoiceName] = useState("");
  
  // Influencer Builder State
  const [influencerName, setInfluencerName] = useState("");
  const [influencerNiche, setInfluencerNiche] = useState("");
  const [influencerPersonality, setInfluencerPersonality] = useState("");
  const [influencerAppearance, setInfluencerAppearance] = useState("");
  
  // Fetch data
  const { data: templates, isLoading: loadingTemplates } = useQuery<ViralTemplate[]>({
    queryKey: ["/api/viral/templates"],
  });
  
  const { data: voices, isLoading: loadingVoices } = useQuery<AiVoice[]>({
    queryKey: ["/api/ai-voices"],
  });
  
  const { data: captionStyles, isLoading: loadingStyles } = useQuery<CaptionStyle[]>({
    queryKey: ["/api/caption-styles"],
  });

  // Generate video mutation
  const generateVideo = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sora/generate", data);
    },
    onSuccess: () => {
      toast({
        title: "Video Generation Started!",
        description: "Your video will be ready in 2-3 minutes. Check your projects.",
      });
    },
  });

  const handleGenerateVideo = () => {
    if (!videoPrompt) {
      toast({
        title: "Missing Information",
        description: "Please provide a video description",
        variant: "destructive",
      });
      return;
    }

    generateVideo.mutate({
      prompt: videoPrompt,
      duration: videoDuration[0],
      aspectRatio,
      voiceId: selectedVoice,
      templateId: selectedTemplate,
      captionStyleId: selectedCaptionStyle,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Creator Studio Pro</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Content Creation</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold">2,450</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
            <Button variant="default" size="sm" className="gap-2" data-testid="button-upgrade">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-camera">
              <Camera className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="video" className="gap-2" data-testid="tab-video">
              <Video className="h-4 w-4" />
              AI Video Generator
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2" data-testid="tab-voice">
              <Mic className="h-4 w-4" />
              Voice Cloner
            </TabsTrigger>
            <TabsTrigger value="influencer" className="gap-2" data-testid="tab-influencer">
              <User className="h-4 w-4" />
              Influencer Builder
            </TabsTrigger>
          </TabsList>

          {/* AI Video Generator */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Inputs */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-primary" />
                      Video Description
                    </CardTitle>
                    <CardDescription>
                      Describe the video you want to create. Be specific for best results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="A young woman walking through a neon-lit Tokyo street at night, wearing a cyberpunk jacket..."
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="min-h-32 resize-none"
                      data-testid="input-video-prompt"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Duration (seconds)</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={videoDuration}
                            onValueChange={setVideoDuration}
                            min={5}
                            max={90}
                            step={5}
                            className="flex-1"
                            data-testid="slider-duration"
                          />
                          <span className="min-w-[3rem] text-right text-sm font-semibold">{videoDuration[0]}s</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Aspect Ratio</Label>
                        <Select value={aspectRatio} onValueChange={setAspectRatio}>
                          <SelectTrigger data-testid="select-aspect-ratio">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9:16">9:16 (TikTok)</SelectItem>
                            <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                            <SelectItem value="1:1">1:1 (Instagram)</SelectItem>
                            <SelectItem value="4:5">4:5 (Instagram Feed)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Viral Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Viral Templates (Optional)
                    </CardTitle>
                    <CardDescription>
                      Use proven viral formats to maximize views
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingTemplates ? (
                      <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {templates?.slice(0, 4).map((template) => (
                          <Card
                            key={template.id}
                            className={`hover-elevate cursor-pointer transition-all ${
                              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedTemplate(template.id!)}
                            data-testid={`template-${template.id}`}
                          >
                            <CardHeader className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-sm">{template.name}</CardTitle>
                                  <CardDescription className="text-xs line-clamp-2 mt-1">
                                    {template.hookFormat}
                                  </CardDescription>
                                </div>
                                {selectedTemplate === template.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <BarChart3 className="h-3 w-3" />
                                  {template.avgViralScore}% viral
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Voice Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      AI Narrator Voice
                    </CardTitle>
                    <CardDescription>
                      Choose a voice for your video narration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingVoices ? (
                      <div className="text-center py-4 text-muted-foreground">Loading voices...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {voices?.slice(0, 6).map((voice) => (
                          <Card
                            key={voice.id}
                            className={`hover-elevate cursor-pointer ${
                              selectedVoice === voice.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedVoice(voice.id!)}
                            data-testid={`voice-${voice.id}`}
                          >
                            <CardHeader className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">{voice.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {voice.gender} • {voice.accent}
                                  </p>
                                </div>
                                {voice.isPremium && <Badge variant="default" className="text-xs">Pro</Badge>}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Caption Style */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Caption Style
                    </CardTitle>
                    <CardDescription>
                      Choose how your captions appear
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingStyles ? (
                      <div className="text-center py-4 text-muted-foreground">Loading styles...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {captionStyles?.slice(0, 4).map((style) => (
                          <Card
                            key={style.id}
                            className={`hover-elevate cursor-pointer ${
                              selectedCaptionStyle === style.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedCaptionStyle(style.id!)}
                            data-testid={`caption-${style.id}`}
                          >
                            <CardHeader className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">{style.name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {style.description}
                                  </p>
                                </div>
                                {style.isPremium && <Badge variant="default" className="text-xs">Pro</Badge>}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview & Generate */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-base">Preview & Generate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Video Preview Placeholder */}
                    <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                      <div className="relative text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-gray-400">
                          {videoPrompt ? "Preview will appear here" : "Enter a description to preview"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Cost Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Video Generation</span>
                        <span className="font-semibold">{videoDuration[0] * 10} credits</span>
                      </div>
                      {selectedVoice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">AI Voice</span>
                          <span className="font-semibold">50 credits</span>
                        </div>
                      )}
                      {selectedCaptionStyle && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Auto Captions</span>
                          <span className="font-semibold">30 credits</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          {videoDuration[0] * 10 + (selectedVoice ? 50 : 0) + (selectedCaptionStyle ? 30 : 0)} credits
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handleGenerateVideo}
                      disabled={!videoPrompt || generateVideo.isPending}
                      data-testid="button-generate-video"
                    >
                      {generateVideo.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Video
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Generation time: ~2-3 minutes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Voice Cloner Tab - Coming Soon */}
          <TabsContent value="voice" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  AI Voice Cloner
                  <Badge variant="default">Pro Feature</Badge>
                </CardTitle>
                <CardDescription>
                  Clone any voice with just 30 seconds of audio. Create unlimited AI voices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mic className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Voice Cloning Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upload a 30-second audio sample and we'll create a perfect AI clone of that voice. 
                    Use it for unlimited content generation.
                  </p>
                  <Button size="lg" className="gap-2" data-testid="button-notify-voice">
                    <Sparkles className="h-4 w-4" />
                    Notify Me When Ready
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Influencer Builder Tab - Coming Soon */}
          <TabsContent value="influencer" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  AI Influencer Builder
                  <Badge variant="default">Pro Feature</Badge>
                </CardTitle>
                <CardDescription>
                  Create photo-realistic AI influencers with consistent appearance across all content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">AI Influencer Builder Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create your own AI influencer with a unique personality, appearance, and voice. 
                    Generate unlimited content featuring your AI influencer.
                  </p>
                  <Button size="lg" className="gap-2" data-testid="button-notify-influencer">
                    <Sparkles className="h-4 w-4" />
                    Notify Me When Ready
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="rounded-full bg-background/95 backdrop-blur-lg shadow-2xl border border-border/50 px-6 py-3">
            <div className="flex items-center justify-around gap-2">
              <button
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover-elevate active-elevate-2 transition-all"
                data-testid="button-chats"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-medium">Chats</span>
              </button>
              
              <button
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover-elevate active-elevate-2 transition-all"
                data-testid="button-calls"
              >
                <Phone className="h-5 w-5" />
                <span className="text-xs font-medium">Calls</span>
              </button>
              
              <button
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover-elevate active-elevate-2 transition-all"
                data-testid="button-updates"
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs font-medium">Updates</span>
              </button>
              
              <button
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover-elevate active-elevate-2 transition-all"
                data-testid="button-tools"
              >
                <Wrench className="h-5 w-5" />
                <span className="text-xs font-medium">Tools</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
