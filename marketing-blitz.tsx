import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Rocket, 
  Target, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Play,
  Pause,
  Plus,
  BarChart3,
  Zap,
  DollarSign,
  Sparkles,
  Brain
} from "lucide-react";
import { 
  SiWhatsapp, 
  SiTiktok, 
  SiInstagram, 
  SiSnapchat, 
  SiFacebook, 
  SiPinterest, 
  SiReddit 
} from "react-icons/si";

const PLATFORMS = [
  { id: "whatsapp", name: "WhatsApp", icon: SiWhatsapp, color: "text-green-500" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "text-pink-500" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "text-purple-500" },
  { id: "snapchat", name: "Snapchat", icon: SiSnapchat, color: "text-yellow-500" },
  { id: "onlyfans", name: "OnlyFans", icon: Users, color: "text-cyan-500" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "text-blue-600" },
  { id: "pinterest", name: "Pinterest", icon: SiPinterest, color: "text-red-600" },
  { id: "reddit", name: "Reddit", icon: SiReddit, color: "text-orange-600" },
];

const PROVEN_TEMPLATES = [
  {
    id: "instant-win",
    name: "Instant Win Method",
    icon: Zap,
    description: "Get clients in 48 hours with 10-minute AI fixes",
    painPoints: ["Need money fast", "Want first client", "Broke"],
    earnings: "$625-$1,650",
    timeframe: "48 hours",
    difficulty: "Beginner-friendly",
    platforms: ["facebook", "whatsapp", "instagram"],
    message: "Hey! I noticed {issue} on your {business_type} - made you a quick AI fix in 10 minutes. Want to see it?",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "loyalty-magnetizer",
    name: "Loyalty Magnetizer",
    icon: Target,
    description: "Automate review replies & posts for local businesses",
    painPoints: ["Businesses need customers", "Want recurring income", "Easy sales"],
    earnings: "$200-$400/month",
    timeframe: "Recurring",
    difficulty: "No cold calling",
    platforms: ["facebook", "instagram"],
    message: "Your business has {num} unreplied 5-star reviews. I created AI responses in 5 mins - want them?",
    color: "from-pink-500 to-purple-500",
  },
  {
    id: "side-hustle",
    name: "Side Hustle Blueprint",
    icon: DollarSign,
    description: "Complete beginner system - no tech skills needed",
    painPoints: ["Broke", "Need side income", "No experience"],
    earnings: "$625-$1,650",
    timeframe: "7 days",
    difficulty: "Zero cold calling",
    platforms: ["tiktok", "instagram", "whatsapp"],
    message: "🚀 Want to earn $625-$1,650 in 7 days using AI? No tech skills needed. Interested?",
    color: "from-green-500 to-cyan-500",
  },
  {
    id: "google-business",
    name: "Google Business Optimizer",
    icon: Target,
    description: "Help local businesses rank higher in Google search",
    painPoints: ["Low local visibility", "Not showing up in Google", "Need more customers"],
    earnings: "$300-$800",
    timeframe: "30 days",
    difficulty: "Easy pitch",
    platforms: ["whatsapp", "facebook"],
    message: "Hi {name}, I help businesses optimize their Google Business Profile to rank higher. Found several in {city} that need help. Interested in a quick chat?",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "website-liquidation",
    name: "Website Liquidation",
    icon: Zap,
    description: "Sell pre-built websites to businesses without one",
    painPoints: ["No website", "Expensive web design", "Need leads fast"],
    earnings: "$1,000-$3,000",
    timeframe: "48 hours",
    difficulty: "High conversion",
    platforms: ["whatsapp", "facebook"],
    message: "Hey {name}, I built a professional {industry} website for a client who went another direction. Normally $3,000, liquidating for $1,000. Want to see it?",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "affiliate-bootcamp",
    name: "7-Day Affiliate Bootcamp",
    icon: Brain,
    description: "Turn followers into 40% recurring commissions",
    painPoints: ["Want passive income", "No product to sell", "Need side hustle"],
    earnings: "40% recurring",
    timeframe: "7 days",
    difficulty: "No tech needed",
    platforms: ["tiktok", "instagram"],
    message: "I just started learning affiliate marketing - no tech, no product. Just one invite link that pays monthly. Join free — link in bio.",
    color: "from-purple-500 to-pink-500",
  },
];

const CONVERSION_PSYCHOLOGY_TEMPLATES = [
  {
    id: "reciprocity",
    name: "Reciprocity (Free Value First)",
    principle: "Give value before asking for anything",
    conversionRate: "30-45%",
    icon: Sparkles,
    description: "People feel obligated to give back when you give first",
    message: "🎁 FREE GIFT: I'm giving you {freebie}. No credit card. No catch. Just pure value. Most people upgrade within 7 days.",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "scarcity",
    name: "Scarcity + Urgency",
    principle: "Limited availability creates desire",
    conversionRate: "25-40%",
    icon: Zap,
    description: "People want more of what they can have less of",
    message: "⚠️ ONLY {number} SPOTS LEFT. Price: ${old_price} → ${new_price}. This deal expires in {hours} hours. After that, price DOUBLES.",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "social-proof",
    name: "Social Proof + Authority",
    principle: "People follow the crowd",
    conversionRate: "20-35%",
    icon: Users,
    description: "Show others are already succeeding",
    message: "Join {number}+ creators making ${amount}/month. 'I made my first ${amount} in {days} days' - {name}. Start free: {link}",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pain-solution",
    name: "Pain → Solution → Action",
    principle: "Amplify pain, offer solution",
    conversionRate: "35-50%",
    icon: Target,
    description: "Connect emotionally through shared struggles",
    message: "Broke? Tired of {pain}? What if you could {solution} in {timeframe}? {number} people already did. You're next.",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "fomo",
    name: "FOMO (Fear of Missing Out)",
    principle: "Create urgency through missed opportunity",
    conversionRate: "28-42%",
    icon: TrendingUp,
    description: "Show what they're missing right now",
    message: "While you're reading this, {number} people just started earning. How much longer will you wait? Don't be left behind.",
    color: "from-yellow-500 to-red-500",
  },
];

export default function MarketingBlitz() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(
    "Hey! 👋 Check out PROFITHACK AI - the ultimate platform for creators, developers & entrepreneurs! Join the revolution at profithackai.com 🚀"
  );

  const { data: campaigns = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/marketing/campaigns", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      toast({
        title: "Campaign Created! 🚀",
        description: "Your marketing blitz is ready to launch!",
      });
      setShowCreateForm(false);
      setCampaignName("");
      setSelectedPlatforms([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      return apiRequest(`/api/marketing/campaigns/${id}/toggle`, "POST", { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
      toast({
        title: "Campaign Updated",
        description: "Campaign status changed successfully",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignName || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter a campaign name and select at least one platform",
        variant: "destructive",
      });
      return;
    }

    createCampaign.mutate({
      name: campaignName,
      platforms: selectedPlatforms,
      config: {
        messageTemplate,
        targeting: {
          interests: ["creators", "entrepreneurs", "developers"],
          ageRange: { min: 18, max: 65 },
        },
        schedule: {
          dailyLimit: 1000,
          hourlyLimit: 100,
        },
        automation: {
          autoReply: true,
          autoFollow: false,
          autoLike: false,
          autoComment: false,
        },
      },
    });
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Marketing Blitz
          </h1>
          <p className="text-muted-foreground mt-1">
            Launch automated campaigns across all major platforms
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          data-testid="button-create-campaign"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" data-testid="tab-templates">
            <Sparkles className="h-4 w-4 mr-2" />
            Proven Templates
          </TabsTrigger>
          <TabsTrigger value="psychology" data-testid="tab-psychology">
            <Brain className="h-4 w-4 mr-2" />
            Psychology
          </TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">
            <BarChart3 className="h-4 w-4 mr-2" />
            My Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PROVEN_TEMPLATES.map((template) => {
              const TemplateIcon = template.icon;
              return (
                <Card key={template.id} className="border-2 hover-elevate" data-testid={`card-template-${template.id}`}>
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r ${template.color} mb-3`}>
                      <TemplateIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Earnings:</span>
                        <span className="font-bold text-green-500">{template.earnings}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="font-semibold">{template.timeframe}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <Badge variant="secondary">{template.difficulty}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Pain Points:</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {template.painPoints.map((point, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Platforms:</Label>
                      <div className="flex gap-2">
                        {template.platforms.map((platformId) => {
                          const platform = PLATFORMS.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <div key={platformId} className="flex items-center gap-1">
                              <Icon className={`h-4 w-4 ${platform.color}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      className={`w-full bg-gradient-to-r ${template.color}`}
                      onClick={() => {
                        setCampaignName(template.name);
                        setMessageTemplate(template.message);
                        setSelectedPlatforms(template.platforms);
                        setShowCreateForm(true);
                      }}
                      data-testid={`button-use-template-${template.id}`}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-4">
          <Card className="border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-pink-500" />
                Conversion Psychology - 6 Weapons of Influence
              </CardTitle>
              <CardDescription>
                Proven psychological triggers that convert followers into paying subscribers (Based on Cialdini's research + NLP)
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CONVERSION_PSYCHOLOGY_TEMPLATES.map((template) => {
              const TemplateIcon = template.icon;
              return (
                <Card key={template.id} className="border-2 hover-elevate" data-testid={`card-psychology-${template.id}`}>
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r ${template.color} mb-3`}>
                      <TemplateIcon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conversion Rate:</span>
                        <span className="font-bold text-green-500">{template.conversionRate}</span>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-xs font-semibold text-primary mb-1">Principle:</p>
                        <p className="text-sm">{template.principle}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-md">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Template:</p>
                        <p className="text-xs font-mono">{template.message}</p>
                      </div>
                    </div>

                    <Button
                      className={`w-full bg-gradient-to-r ${template.color}`}
                      onClick={() => {
                        setCampaignName(template.name);
                        setMessageTemplate(template.message);
                        setShowCreateForm(true);
                      }}
                      data-testid={`button-use-psychology-${template.id}`}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Use This Psychology
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                Emotional Triggers for Maximum Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-red-500">FOMO (Fear of Missing Out)</h4>
                  <p className="text-xs text-muted-foreground">While you're reading this, {'{number}'} people just started earning. How much longer will you wait?</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-green-500">GREED</h4>
                  <p className="text-xs text-muted-foreground">Imagine waking up to ${'{amount}'} in your account. Every. Single. Day.</p>
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-orange-500">PAIN/FRUSTRATION</h4>
                  <p className="text-xs text-muted-foreground">Broke? Tired of working 60hrs/week? There's a way out in 30 days.</p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-blue-500">HOPE/ASPIRATION</h4>
                  <p className="text-xs text-muted-foreground">You're one decision away from the life you've always wanted. This is it.</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-purple-500">CURIOSITY</h4>
                  <p className="text-xs text-muted-foreground">The one thing nobody tells you about {'{topic}'}... (They don't want you to know)</p>
                </div>
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-1 text-cyan-500">TRUST/SAFETY</h4>
                  <p className="text-xs text-muted-foreground">30-day guarantee. Zero risk. Don't make ${'{amount}'}? Get refunded + $100.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
      {showCreateForm && (
        <Card className="border-pink-500/20">
          <CardHeader>
            <CardTitle>Create Marketing Campaign</CardTitle>
            <CardDescription>
              Target users across multiple platforms with automated outreach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                data-testid="input-campaign-name"
                placeholder="e.g., November Launch Blitz"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      data-testid={`button-platform-${platform.id}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-border hover-elevate"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${platform.color}`} />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-template">Message Template</Label>
              <Textarea
                id="message-template"
                data-testid="textarea-message-template"
                placeholder="Your outreach message..."
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaign.isPending}
                data-testid="button-submit-campaign"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {createCampaign.isPending ? "Creating..." : "Launch Campaign"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

        <div className="grid gap-4">
          {campaigns?.map((campaign: any) => (
            <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{campaign.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {campaign.platforms.map((platformId: string) => {
                        const platform = PLATFORMS.find(p => p.id === platformId);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                          <Badge key={platformId} variant="secondary" className="gap-1.5">
                            <Icon className={`h-3 w-3 ${platform.color}`} />
                            {platform.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <Badge
                    variant={campaign.status === "active" ? "default" : "secondary"}
                    data-testid={`status-${campaign.id}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Reached</div>
                      <div className="font-bold" data-testid={`text-reached-${campaign.id}`}>
                        {campaign.totalReached?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Clicks</div>
                      <div className="font-bold" data-testid={`text-clicks-${campaign.id}`}>
                        {campaign.totalClicks?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Signups</div>
                      <div className="font-bold text-green-500" data-testid={`text-signups-${campaign.id}`}>
                        {campaign.totalSignups?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">CVR</div>
                      <div className="font-bold" data-testid={`text-cvr-${campaign.id}`}>
                        {campaign.totalReached > 0
                          ? `${((campaign.totalSignups / campaign.totalReached) * 100).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={campaign.status === "active" ? "outline" : "default"}
                    onClick={() => toggleCampaign.mutate({
                      id: campaign.id,
                      action: campaign.status === "active" ? "stop" : "start"
                    })}
                    disabled={toggleCampaign.isPending}
                    data-testid={`button-toggle-${campaign.id}`}
                  >
                    {campaign.status === "active" ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!campaigns || campaigns.length === 0) && !showCreateForm && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Launch your first marketing blitz to reach thousands of potential users!
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-first-campaign"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
