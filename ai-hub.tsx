/**
 * PROFITHACK AI - AI Hub Central Command
 * All AI features, tools, creators, and automation in one place
 * ELITE2026 Integration - 26 AI Creators, 200+ Agents, Enterprise Features
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AISection } from "@/components/AISection";
import { 
  Sparkles, 
  Video, 
  Wand2, 
  Image, 
  MessageSquare, 
  Code, 
  Music,
  Mic,
  Brain,
  Zap,
  Star,
  Coins,
  Crown,
  Rocket,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AI_FEATURES = [
  {
    id: 'sora',
    title: 'Sora 2 Video',
    description: 'Generate stunning videos with OpenAI Sora 2',
    icon: Video,
    gradient: 'from-pink-500 to-rose-600',
    path: '/sora-generator',
    credits: 100,
    popular: true,
  },
  {
    id: 'video-gen',
    title: 'AI Video Creator',
    description: 'Create viral videos in seconds',
    icon: Sparkles,
    gradient: 'from-purple-500 to-indigo-600',
    path: '/video-generator',
    credits: 50,
    popular: true,
  },
  {
    id: 'content-studio',
    title: 'Creator Studio',
    description: 'Programmable video effects',
    icon: Wand2,
    gradient: 'from-cyan-500 to-blue-600',
    path: '/creator-studio',
    credits: 25,
  },
  {
    id: 'image-gen',
    title: 'AI Images',
    description: 'Generate stunning visuals',
    icon: Image,
    gradient: 'from-orange-500 to-red-600',
    path: '/ai-tools?tab=images',
    credits: 20,
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    description: 'ChatGPT-style workspace',
    icon: MessageSquare,
    gradient: 'from-green-500 to-emerald-600',
    path: '/ai-workspace',
    credits: 10,
  },
  {
    id: 'code-assistant',
    title: 'Code AI',
    description: 'AI-powered coding help',
    icon: Code,
    gradient: 'from-violet-500 to-purple-600',
    path: '/workspace',
    credits: 15,
  },
  {
    id: 'voice-clone',
    title: 'Voice Cloning',
    description: 'Clone any voice with AI',
    icon: Mic,
    gradient: 'from-yellow-500 to-amber-600',
    path: '/ai-tools?tab=voice',
    credits: 30,
  },
  {
    id: 'music-gen',
    title: 'AI Music',
    description: 'Generate background music',
    icon: Music,
    gradient: 'from-pink-500 to-purple-600',
    path: '/ai-tools?tab=music',
    credits: 40,
  },
  {
    id: 'ai-marketing',
    title: 'Marketing Bots',
    description: '200-agent automation',
    icon: Brain,
    gradient: 'from-indigo-500 to-blue-600',
    path: '/bots',
    credits: 0,
  },
];

export default function AIHub() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const { data: user } = useQuery<{ credits?: number }>({
    queryKey: ['/api/auth/user'],
  });

  const credits = user?.credits || 0;

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'create', label: 'Create', icon: Wand2 },
    { id: 'code', label: 'Code', icon: Code },
  ];

  const handleFeatureClick = (feature: typeof AI_FEATURES[0]) => {
    if (feature.credits > credits && feature.credits > 0) {
      toast({
        title: "Not enough credits",
        description: `You need ${feature.credits} credits. Buy more in your wallet.`,
        variant: "destructive",
      });
      return;
    }
    window.location.href = feature.path;
  };

  const eliteCreators = [
    { id: "expert_creator_21", name: "Brinley Vyx", revenue: "$92K/mo", tier: "ELITE" },
    { id: "expert_creator_22", name: "Ayla Vibes", revenue: "$90K/mo", tier: "ELITE" },
    { id: "expert_creator_23", name: "Kaia Flux", revenue: "$88K/mo", tier: "ELITE" },
    { id: "expert_creator_24", name: "Zane Pulse", revenue: "$86K/mo", tier: "ELITE" },
    { id: "expert_creator_25", name: "Ember Rise", revenue: "$95K/mo", tier: "ELITE" },
    { id: "expert_creator_26", name: "Luna Rose", revenue: "$89K/mo", tier: "ELITE" },
  ];

  const aiAgents = [
    { name: "Viral Hook Generator", status: "Active", tasks: "1,247" },
    { name: "Trending Topic Analyzer", status: "Active", tasks: "892" },
    { name: "Engagement Maximizer", status: "Active", tasks: "2,103" },
    { name: "Viral Coefficient Optimizer", status: "Active", tasks: "634" },
    { name: "Audience Psychology Analyzer", status: "Active", tasks: "1,558" },
    { name: "Posting Schedule Optimizer", status: "Active", tasks: "921" },
  ];

  const quickStats = [
    { icon: Brain, label: "AI Agents", value: "200+", color: "from-cyan-400 to-blue-500" },
    { icon: Crown, label: "AI Creators", value: "26", color: "from-pink-400 to-purple-500" },
    { icon: Video, label: "Videos Generated", value: "17K+", color: "from-orange-400 to-red-500" },
    { icon: TrendingUp, label: "Revenue Target", value: "$63M", color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-cyan-500/30 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-pink-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  AI Command Center
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Enterprise AI Platform • ELITE2026 • 200+ Active Agents
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30">
                <Coins className="w-4 h-4 text-pink-500" />
                <span className="text-white font-bold text-sm">{credits.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card key={idx} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Features Section */}
          <div className="lg:col-span-2">
            <AISection />
          </div>

          {/* Sidebar - ELITE2026 & Stats */}
          <div className="space-y-6">
            {/* ELITE2026 Creators */}
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-orange-400" />
                  <CardTitle className="text-white">ELITE2026 Premium</CardTitle>
                </div>
                <CardDescription>Top 6 AI creators earning $86K-$95K/mo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {eliteCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="p-3 rounded-lg bg-black/50 border border-gray-700 hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`elite-creator-${creator.id}`}
                    onClick={() => window.location.href = `/onlyfans?creator=${creator.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{creator.name}</div>
                        <div className="text-sm text-gray-400">{creator.revenue}</div>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-600 to-red-600 border-0">
                        {creator.tier}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  onClick={() => window.location.href = '/onlyfans'}
                  data-testid="button-view-all-elite"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View All Elite Creators
                </Button>
              </CardContent>
            </Card>

            {/* AI Agents Status */}
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-cyan-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white">Active AI Agents</CardTitle>
                </div>
                <CardDescription>Enterprise CRM automation agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiAgents.map((agent, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-black/50 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{agent.name}</span>
                      <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-[10px]">
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">{agent.tasks} tasks completed</div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-cyan-500/30 hover:bg-cyan-500/10"
                  onClick={() => window.location.href = '/crm'}
                  data-testid="button-manage-agents"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Manage Agents
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
