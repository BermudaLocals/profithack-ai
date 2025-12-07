import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, Megaphone, Calendar, Zap, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AITools() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("thumbnails");

  // Fetch user credits
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              AI Creator Tools
            </h1>
            <p className="text-muted-foreground mt-2">
              Professional content creation in seconds. 10x faster than any course.
            </p>
          </div>
          <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10">
            <CardContent className="p-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Your Credits</p>
                <p className="text-2xl font-bold">{user?.credits?.toLocaleString() || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="thumbnails" className="flex items-center gap-2" data-testid="tab-thumbnails">
              <Sparkles className="w-4 h-4" />
              Thumbnails
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2" data-testid="tab-scripts">
              <FileText className="w-4 h-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2" data-testid="tab-ads">
              <Megaphone className="w-4 h-4" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2" data-testid="tab-planner">
              <Calendar className="w-4 h-4" />
              Content Planner
            </TabsTrigger>
          </TabsList>

          {/* Thumbnail Engineer */}
          <TabsContent value="thumbnails">
            <ThumbnailEngineer userCredits={user?.credits || 0} />
          </TabsContent>

          {/* Script Factory */}
          <TabsContent value="scripts">
            <ScriptFactory userCredits={user?.credits || 0} />
          </TabsContent>

          {/* Ad Generator */}
          <TabsContent value="ads">
            <AdGenerator userCredits={user?.credits || 0} />
          </TabsContent>

          {/* Content Planner */}
          <TabsContent value="planner">
            <ContentPlanner userCredits={user?.credits || 0} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// AI Thumbnail Engineer Component
function ThumbnailEngineer({ userCredits }: { userCredits: number }) {
  const { toast } = useToast();
  const [videoTitle, setVideoTitle] = useState("");
  const [niche, setNiche] = useState("tech");
  const [style, setStyle] = useState("dramatic");
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!videoTitle.trim()) {
      toast({ title: "Video title required", variant: "destructive" });
      return;
    }

    if (userCredits < 10) {
      toast({ title: "Insufficient credits", description: "Need 10 credits to generate thumbnails", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest("/api/ai/thumbnails/generate", {
        method: "POST",
        body: JSON.stringify({ videoTitle, niche, style }),
        headers: { "Content-Type": "application/json" }
      });

      setThumbnails(result.thumbnails);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "✅ Thumbnails Generated!",
        description: `10 high-CTR thumbnails ready. ${result.creditsRemaining} credits remaining.`
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate thumbnails",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            AI Thumbnail Engineer
          </CardTitle>
          <CardDescription>
            Generate 10 high-CTR thumbnail variations in 30 seconds. No Photoshop required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              placeholder="How I Made $10K in 30 Days"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              data-testid="input-video-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche">Niche</Label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger id="niche" data-testid="select-niche">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id="style" data-testid="select-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dramatic">Dramatic</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="colorful">Colorful</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || userCredits < 10}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
            data-testid="button-generate-thumbnails"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate 10 Thumbnails (10 credits)
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            10 thumbnails with A/B testing scores. 68% cheaper than hiring a designer.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generated Thumbnails ({thumbnails.length}/10)</h3>
        {thumbnails.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {thumbnails.map((thumb, idx) => (
              <Card key={idx} className="hover-elevate overflow-hidden" data-testid={`thumbnail-${idx}`}>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <p className="text-xs text-white/70">{thumb.prompt}</p>
                  <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                    CTR: {thumb.ctrScore}%
                  </div>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground capitalize">{thumb.style}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your thumbnails will appear here</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// AI Script Factory Component
function ScriptFactory({ userCredits }: { userCredits: number }) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("short");
  const [platform, setPlatform] = useState("tiktok");
  const [script, setScript] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", variant: "destructive" });
      return;
    }

    if (userCredits < 5) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest("/api/ai/scripts/generate", {
        method: "POST",
        body: JSON.stringify({ topic, format, platform }),
        headers: { "Content-Type": "application/json" }
      });

      setScript(result);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "✅ Script Generated!",
        description: `Viral script ready. Estimated ${result.estimatedViews.toLocaleString()} views.`
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            AI Script Factory
          </CardTitle>
          <CardDescription>
            Generate viral scripts in 60 seconds. Perfect hook, engaging body, strong CTA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Video Topic</Label>
            <Input
              id="topic"
              placeholder="How to grow on TikTok in 2026"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              data-testid="input-topic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format" data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (60s)</SelectItem>
                  <SelectItem value="medium">Medium (5-10min)</SelectItem>
                  <SelectItem value="long">Long (20+ min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform" data-testid="select-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || userCredits < 5}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
            data-testid="button-generate-script"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Script (5 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Script</CardTitle>
          <CardDescription>
            {script ? `Viral Score: ${script.viralScore}/100 • Est. ${script.estimatedViews.toLocaleString()} views` : 'Your script will appear here'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {script ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-pink-500">Hook (First 3 seconds):</p>
                <p className="text-sm bg-muted p-3 rounded" data-testid="script-hook">{script.hook}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-purple-500">Full Script:</p>
                <Textarea value={script.script} readOnly className="min-h-[200px]" data-testid="script-content" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-cyan-500">Call to Action:</p>
                <p className="text-sm bg-muted p-3 rounded" data-testid="script-cta">{script.cta}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Keywords:</p>
                <div className="flex flex-wrap gap-2" data-testid="script-keywords">
                  {script.keywords.map((kw: string, idx: number) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Your script will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// AI Ad Generator Component
function AdGenerator({ userCredits }: { userCredits: number }) {
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [ads, setAds] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({ title: "Product name and description required", variant: "destructive" });
      return;
    }

    if (userCredits < 15) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest("/api/ai/ads/generate", {
        method: "POST",
        body: JSON.stringify({ productName, productDescription }),
        headers: { "Content-Type": "application/json" }
      });

      setAds(result.ads);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "✅ Ads Generated!",
        description: `10 profitable ad variations ready. ${result.creditsRemaining} credits remaining.`
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-500" />
            AI Ad Generator
          </CardTitle>
          <CardDescription>
            Generate 10 high-converting ad variations. Tested formulas from $275K ad spend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="AI Thumbnail Generator"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              data-testid="input-product-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Product Description</Label>
            <Textarea
              id="product-description"
              placeholder="Generate professional thumbnails in seconds. No design skills needed."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              data-testid="textarea-product-description"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || userCredits < 15}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
            data-testid="button-generate-ads"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate 10 Ads (15 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generated Ads ({ads.length}/10)</h3>
        {ads.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {ads.map((ad, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`ad-${idx}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                      {ad.platform}
                    </span>
                    <span className="text-xs text-pink-500 font-semibold">
                      CTR: {ad.predictedCtr}%
                    </span>
                  </div>
                  <p className="font-semibold">{ad.headline}</p>
                  <p className="text-sm text-muted-foreground">{ad.body}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    {ad.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your ads will appear here</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// AI Content Planner Component
function ContentPlanner({ userCredits }: { userCredits: number }) {
  const { toast } = useToast();
  const [niche, setNiche] = useState("");
  const [goals, setGoals] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok"]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!niche.trim() || !goals.trim()) {
      toast({ title: "Niche and goals required", variant: "destructive" });
      return;
    }

    if (userCredits < 20) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest("/api/ai/content-plans/generate", {
        method: "POST",
        body: JSON.stringify({ niche, goals, platforms }),
        headers: { "Content-Type": "application/json" }
      });

      setCalendar(result.contentCalendar);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "✅ Content Plan Generated!",
        description: `30-day calendar ready. ${result.creditsRemaining} credits remaining.`
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            AI Content Planner
          </CardTitle>
          <CardDescription>
            30-day content calendar in 30 minutes. Topics, hooks, hashtags, and posting schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="niche">Your Niche</Label>
            <Input
              id="niche"
              placeholder="Tech reviews, fitness, cooking..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              data-testid="input-niche"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Your Goals</Label>
            <Textarea
              id="goals"
              placeholder="Grow to 10K followers, monetize, build personal brand..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              data-testid="textarea-goals"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || userCredits < 20}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90"
            data-testid="button-generate-plan"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate 30-Day Plan (20 credits)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">30-Day Calendar ({calendar.length} posts)</h3>
        {calendar.length > 0 ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {calendar.slice(0, 10).map((item, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`calendar-item-${idx}`}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.topic}</p>
                    <p className="text-xs text-muted-foreground">{item.date} • {item.platform}</p>
                  </div>
                  <span className="text-xs bg-pink-500/10 text-pink-500 px-2 py-1 rounded">
                    {item.type}
                  </span>
                </CardContent>
              </Card>
            ))}
            {calendar.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">
                + {calendar.length - 10} more posts
              </p>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your content calendar will appear here</p>
          </Card>
        )}
      </div>
    </div>
  );
}
