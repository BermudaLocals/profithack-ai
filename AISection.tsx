/**
 * PROFITHACK AI - Comprehensive AI Features Section
 * All AI tools, creators, generators, and automation organized with dropdowns
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Brain,
  Video,
  Users,
  MessageCircle,
  Rocket,
  Zap,
  Crown,
  Code,
  TrendingUp,
  Image as ImageIcon,
  Mic,
  Bot,
  Wand2,
  Eye,
  Target,
  BarChart3,
  Heart,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIFeature {
  label: string;
  path: string;
  description?: string;
  new?: boolean;
  premium?: boolean;
  elite?: boolean;
}

interface AICategory {
  id: string;
  title: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  features: AIFeature[];
}

export function AISection() {
  const [location, setLocation] = useLocation();
  const [openItems, setOpenItems] = useState<string[]>(["ai-creators"]);

  const aiCategories: AICategory[] = [
    {
      id: "ai-creators",
      title: "🔥 AI Creators (ELITE2026)",
      icon: Crown,
      badge: "ELITE",
      badgeColor: "from-orange-500 to-red-600",
      features: [
        { label: "OnlyFans Expert Creators (26 Total)", path: "/onlyfans", elite: true, new: true },
        { label: "ELITE2026 Premium Tier (6 Creators)", path: "/onlyfans?tier=elite", elite: true },
        { label: "Live AI Chat with Creators", path: "/onlyfans?action=chat", elite: true },
        { label: "Deploy Creator to Platforms", path: "/onlyfans?action=deploy", elite: true },
        { label: "Creator Business Mentorship", path: "/onlyfans?action=mentor", elite: true },
        { label: "Multi-Platform Deployment", path: "/deployment", elite: true },
      ],
    },
    {
      id: "ai-video-generation",
      title: "🎬 AI Video Generation",
      icon: Video,
      badge: "HOT",
      badgeColor: "from-cyan-500 to-blue-600",
      features: [
        { label: "Sora 2 Video Generator", path: "/sora", new: true, premium: true, description: "OpenAI's Sora 2 for ultra-realistic videos" },
        { label: "AI Video Templates", path: "/video-generator", premium: true },
        { label: "Viral Hook Generator", path: "/ai-hub?tool=hooks", new: true },
        { label: "Content Optimizer", path: "/ai-hub?tool=optimizer" },
        { label: "Auto Edit & Effects", path: "/ai-hub?tool=effects" },
      ],
    },
    {
      id: "ai-content-creation",
      title: "✍️ AI Content Creation",
      icon: Wand2,
      features: [
        { label: "AI Script Writer", path: "/ai-hub?tool=script" },
        { label: "Viral Caption Generator", path: "/ai-hub?tool=captions" },
        { label: "Hashtag Optimizer", path: "/ai-hub?tool=hashtags" },
        { label: "Trend Analyzer", path: "/ai-hub?tool=trends", new: true },
        { label: "Content Calendar AI", path: "/ai-hub?tool=calendar" },
        { label: "Thumbnail Generator", path: "/ai-hub?tool=thumbnails" },
      ],
    },
    {
      id: "ai-chat-assistants",
      title: "💬 AI Chat & Assistants",
      icon: MessageCircle,
      features: [
        { label: "AI Workspace (ChatGPT Style)", path: "/ai-workspace", description: "GPT-4, Claude, Gemini Pro" },
        { label: "AI Chat Assistant", path: "/ai-chat" },
        { label: "Kush Support Bot", path: "/support", description: "24/7 AI Support" },
        { label: "FAQ Chatbot", path: "/faq" },
        { label: "Business Advisor AI", path: "/ai-hub?tool=advisor", elite: true },
      ],
    },
    {
      id: "ai-marketing-automation",
      title: "📈 AI Marketing & CRM",
      icon: TrendingUp,
      badge: "PRO",
      badgeColor: "from-purple-500 to-pink-600",
      features: [
        { label: "Enterprise CRM with 6 AI Agents", path: "/crm", new: true, elite: true },
        { label: "Viral Content Generator", path: "/crm?tab=content", elite: true },
        { label: "Multi-Platform Posting", path: "/crm?tab=platforms", elite: true },
        { label: "Analytics Dashboard", path: "/crm?tab=analytics", elite: true },
        { label: "Marketing Bots (5 Active)", path: "/bots" },
        { label: "Engagement Maximizer", path: "/ai-hub?tool=engagement" },
        { label: "Audience Psychology Analyzer", path: "/ai-hub?tool=psychology", elite: true },
      ],
    },
    {
      id: "ai-image-generation",
      title: "🎨 AI Image & Avatar Generation",
      icon: ImageIcon,
      features: [
        { label: "AI Avatar Creator", path: "/ai-hub?tool=avatar", new: true },
        { label: "Profile Photo Generator", path: "/ai-hub?tool=profile-photo" },
        { label: "Brand Logo Designer", path: "/ai-hub?tool=logo" },
        { label: "Banner Creator", path: "/ai-hub?tool=banner" },
        { label: "Meme Generator", path: "/ai-hub?tool=memes" },
      ],
    },
    {
      id: "ai-voice-audio",
      title: "🎙️ AI Voice & Audio",
      icon: Mic,
      features: [
        { label: "AI Voice Cloning", path: "/ai-hub?tool=voice-clone", premium: true },
        { label: "Text-to-Speech Generator", path: "/ai-hub?tool=tts" },
        { label: "Music Generator", path: "/ai-hub?tool=music" },
        { label: "Sound Effects AI", path: "/ai-hub?tool=sfx" },
        { label: "Podcast Creator", path: "/ai-hub?tool=podcast", new: true },
      ],
    },
    {
      id: "ai-code-development",
      title: "💻 AI Code & Development",
      icon: Code,
      features: [
        { label: "Code Workspace (AI-Powered IDE)", path: "/workspace" },
        { label: "AI Code Assistant", path: "/ai-hub?tool=code" },
        { label: "Bug Fixer AI", path: "/ai-hub?tool=debug" },
        { label: "Code Generator", path: "/ai-hub?tool=codegen" },
        { label: "API Integration Helper", path: "/ai-hub?tool=api" },
      ],
    },
    {
      id: "ai-influencer-tools",
      title: "👥 AI Influencer & Cloning",
      icon: Users,
      badge: "NEW",
      badgeColor: "from-green-500 to-emerald-600",
      features: [
        { label: "AI Influencer Creator", path: "/influencers/create", new: true },
        { label: "AI Cloner (Clone Yourself)", path: "/ai-cloner", premium: true },
        { label: "Virtual Influencer Manager", path: "/ai-hub?tool=influencer", elite: true },
        { label: "Brand Personality AI", path: "/ai-hub?tool=brand-personality" },
      ],
    },
    {
      id: "ai-analytics-insights",
      title: "📊 AI Analytics & Insights",
      icon: BarChart3,
      features: [
        { label: "Performance Predictor", path: "/ai-hub?tool=predictor", elite: true },
        { label: "Viral Coefficient Optimizer", path: "/ai-hub?tool=viral-coefficient", elite: true },
        { label: "Engagement Pattern Analyzer", path: "/ai-hub?tool=patterns" },
        { label: "Revenue Forecaster", path: "/ai-hub?tool=revenue", premium: true },
        { label: "Trending Topic Analyzer", path: "/ai-hub?tool=trending-topics", new: true },
      ],
    },
    {
      id: "ai-dating-matchmaking",
      title: "💕 AI Dating & Matchmaking",
      icon: Heart,
      features: [
        { label: "AI Compatibility Scorer", path: "/love?tool=compatibility" },
        { label: "Profile Optimizer AI", path: "/dating?tool=profile" },
        { label: "Icebreaker Generator", path: "/dating?tool=icebreaker" },
        { label: "Conversation Coach", path: "/dating?tool=coach", premium: true },
      ],
    },
    {
      id: "ai-monetization",
      title: "💰 AI Monetization Tools",
      icon: DollarSign,
      badge: "REVENUE",
      badgeColor: "from-yellow-500 to-orange-600",
      features: [
        { label: "Pricing Optimizer AI", path: "/ai-hub?tool=pricing", elite: true },
        { label: "Upsell Strategy Generator", path: "/ai-hub?tool=upsell" },
        { label: "Subscription Retention AI", path: "/ai-hub?tool=retention", premium: true },
        { label: "Revenue Maximizer", path: "/ai-hub?tool=revenue-max", elite: true },
        { label: "Conversion Rate Optimizer", path: "/ai-hub?tool=conversion" },
      ],
    },
    {
      id: "ai-automation",
      title: "⚡ AI Automation & Bots",
      icon: Rocket,
      features: [
        { label: "Agent Orchestration (200 Agents)", path: "/ai-hub?tool=orchestrator", elite: true },
        { label: "Auto-Poster Bot", path: "/bots?type=auto-post" },
        { label: "Engagement Bot", path: "/bots?type=engagement" },
        { label: "DM Response Bot", path: "/bots?type=dm-response", premium: true },
        { label: "Content Scheduler Bot", path: "/bots?type=scheduler" },
      ],
    },
    {
      id: "ai-recommendation",
      title: "🎯 AI Recommendation Engine",
      icon: Target,
      features: [
        { label: "XAI Explainable Recommendations", path: "/ai-hub?tool=xai" },
        { label: "Content Discovery AI", path: "/ai-hub?tool=discovery" },
        { label: "Personalization Engine", path: "/ai-hub?tool=personalization", elite: true },
        { label: "Multi-Factor Scoring", path: "/ai-hub?tool=scoring" },
      ],
    },
    {
      id: "ai-moderation",
      title: "🛡️ AI Moderation & Safety",
      icon: Eye,
      features: [
        { label: "Content Moderation AI", path: "/ai-hub?tool=moderation" },
        { label: "Spam Filter AI", path: "/ai-hub?tool=spam-filter" },
        { label: "Toxicity Detector", path: "/ai-hub?tool=toxicity" },
        { label: "Copyright Checker", path: "/ai-hub?tool=copyright" },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-orange-500/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              AI Command Center
            </h2>
          </div>
          <p className="text-gray-400 text-sm">
            200+ AI agents • 26 AI creators • ELITE2026 platform • Enterprise automation
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 border-0">
              6 AI Agents Active
            </Badge>
            <Badge className="bg-gradient-to-r from-orange-600 to-red-600 border-0">
              ELITE2026
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
              $63M Revenue Target
            </Badge>
          </div>
        </div>
      </div>

      {/* AI Categories Accordion */}
      <ScrollArea className="h-[600px] pr-4">
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
          {aiCategories.map((category) => {
            const Icon = category.icon;
            
            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border-b border-gray-800 mb-2"
              >
                <AccordionTrigger className="hover:no-underline py-3 px-4 rounded-lg hover:bg-gray-900/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-left font-semibold text-white">
                      {category.title}
                    </span>
                    {category.badge && (
                      <Badge
                        className={cn(
                          "text-[10px] px-2 py-0 h-5 border-0",
                          category.badgeColor
                            ? `bg-gradient-to-r ${category.badgeColor}`
                            : "bg-gradient-to-r from-yellow-500 to-orange-500"
                        )}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="space-y-2">
                    {category.features.map((feature, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(feature.path)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-all hover-elevate active-elevate-2",
                          location === feature.path
                            ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-gray-900/50 text-gray-300 hover:text-white hover:bg-gray-800"
                        )}
                        data-testid={`ai-feature-${category.id}-${idx}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{feature.label}</span>
                          <div className="flex items-center gap-1">
                            {feature.new && (
                              <Badge className="text-[8px] px-1.5 py-0 h-4 bg-gradient-to-r from-green-600 to-emerald-600 border-0">
                                NEW
                              </Badge>
                            )}
                            {feature.premium && (
                              <Badge className="text-[8px] px-1.5 py-0 h-4 bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                                PRO
                              </Badge>
                            )}
                            {feature.elite && (
                              <Badge className="text-[8px] px-1.5 py-0 h-4 bg-gradient-to-r from-orange-600 to-red-600 border-0">
                                ELITE
                              </Badge>
                            )}
                          </div>
                        </div>
                        {feature.description && (
                          <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">200+</div>
          <div className="text-xs text-gray-400">AI Agents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400">26</div>
          <div className="text-xs text-gray-400">AI Creators</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">150+</div>
          <div className="text-xs text-gray-400">AI Tools</div>
        </div>
      </div>
    </div>
  );
}
