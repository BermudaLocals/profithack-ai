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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Upload,
  Link as LinkIcon,
  Wand2,
  Sparkles,
  Video,
  Type,
  Mic,
  Image as ImageIcon,
  Music,
  Check,
} from "lucide-react";
import type { CaptionStyle, AiVoice, ViralTemplate, VideoProject } from "@shared/schema";

export default function VideoGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourceType, setSourceType] = useState<"upload" | "youtube" | "tiktok" | "text">("text");
  
  // Form state
  const [title, setTitle] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [backgroundType, setBackgroundType] = useState("minecraft");
  
  // Fetch caption styles
  const { data: captionStyles } = useQuery<CaptionStyle[]>({
    queryKey: ["/api/caption-styles"],
  });
  
  // Fetch AI voices
  const { data: voices } = useQuery<AiVoice[]>({
    queryKey: ["/api/ai-voices"],
  });
  
  // Fetch viral templates
  const { data: templates } = useQuery<ViralTemplate[]>({
    queryKey: ["/api/viral/templates"],
  });
  
  // Create video project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/video-projects", data);
    },
    onSuccess: () => {
      toast({
        title: "Video project created!",
        description: "Your video is being generated. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/video-projects"] });
    },
  });
  
  const handleGenerate = () => {
    const projectData = {
      title: title || "Untitled Project",
      projectType: sourceType === "text" ? "ai_generate" : "clip_edit",
      sourceType,
      sourceUrl: sourceType !== "text" ? sourceUrl : undefined,
      textPrompt: sourceType === "text" ? textPrompt : undefined,
      captionStyleId: selectedCaptionStyle,
      aiVoiceId: selectedVoice,
      templateId: selectedTemplate || undefined,
      backgroundVideoType: backgroundType,
      autoCaptionsEnabled: true,
    };
    
    createProjectMutation.mutate(projectData);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6" data-testid="page-video-generator">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Video Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Create viral videos in 3 simple steps - Crayo-style
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          {step}/3 Steps Complete
        </Badge>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-4 bg-muted/30 rounded-lg p-4">
        {[
          { num: 1, label: "Upload Content", icon: Upload },
          { num: 2, label: "Customize Style", icon: Type },
          { num: 3, label: "Generate Video", icon: Video },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                Step {s.num}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 1: Upload or Generate Content
            </CardTitle>
            <CardDescription>
              Choose your source - upload a video, paste a link, or generate from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                placeholder="My Viral Video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>

            <Tabs value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text" data-testid="tab-text">
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Generate
                </TabsTrigger>
                <TabsTrigger value="upload" data-testid="tab-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="youtube" data-testid="tab-youtube">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="tiktok" data-testid="tab-tiktok">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  TikTok
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Text Prompt</Label>
                  <Textarea
                    placeholder="Describe the video you want to create... e.g., 'Create a video about the Simpsons predicting the 2025 tech crash'"
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    className="min-h-32"
                    data-testid="input-prompt"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Viral Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Choose a proven viral format" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id!}>
                          {template.name} - {template.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drop your video file here</p>
                  <p className="text-xs text-muted-foreground mb-4">Supports MP4, MOV, AVI up to 500MB</p>
                  <Button variant="outline" data-testid="button-upload">
                    Browse Files
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    data-testid="input-youtube"
                  />
                </div>
              </TabsContent>

              <TabsContent value="tiktok" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>TikTok URL</Label>
                  <Input
                    placeholder="https://tiktok.com/@username/video/..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    data-testid="input-tiktok"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep(2)}
              disabled={
                (sourceType === "text" && !textPrompt) ||
                (sourceType !== "text" && sourceType !== "upload" && !sourceUrl)
              }
              data-testid="button-next-step1"
            >
              Continue to Customization
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customize Style */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Caption Style
              </CardTitle>
              <CardDescription>Choose from 15+ viral caption styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!captionStyles || captionStyles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Loading styles...</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {captionStyles.map((style) => (
                    <Card
                      key={style.id}
                      className={`p-4 hover-elevate cursor-pointer ${
                        selectedCaptionStyle === style.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedCaptionStyle(style.id!)}
                      data-testid={`caption-style-${style.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{style.name}</p>
                          <p className="text-xs text-muted-foreground">{style.description}</p>
                        </div>
                        {style.isPremium && <Badge variant="default">Pro</Badge>}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  AI Voice
                </CardTitle>
                <CardDescription>Select your narrator voice</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger data-testid="select-voice">
                    <SelectValue placeholder="Choose a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices?.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id!}>
                        {voice.name} - {voice.gender} ({voice.accent})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Background Video
                </CardTitle>
                <CardDescription>Choose your background footage</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={backgroundType} onValueChange={setBackgroundType}>
                  <SelectTrigger data-testid="select-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minecraft">Minecraft Parkour</SelectItem>
                    <SelectItem value="subway_surfers">Subway Surfers</SelectItem>
                    <SelectItem value="gta">GTA Driving</SelectItem>
                    <SelectItem value="satisfying">Satisfying Videos</SelectItem>
                    <SelectItem value="stock">Stock Footage</SelectItem>
                    <SelectItem value="none">No Background</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={!selectedCaptionStyle || !selectedVoice}
                data-testid="button-next-step2"
              >
                Continue to Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Step 3: Review & Generate
            </CardTitle>
            <CardDescription>Your video will be generated in under 60 seconds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Project Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{title || "Untitled"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{sourceType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Caption Style</p>
                  <p className="font-medium">
                    {captionStyles?.find((s) => s.id === selectedCaptionStyle)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Voice</p>
                  <p className="font-medium">{voices?.find((v) => v.id === selectedVoice)?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Background</p>
                  <p className="font-medium capitalize">{backgroundType.replace("_", " ")}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1 gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={createProjectMutation.isPending}
                data-testid="button-generate"
              >
                <Sparkles className="h-4 w-4" />
                {createProjectMutation.isPending ? "Generating..." : "Generate Video"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
