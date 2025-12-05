/**
 * PROFITHACK AI - Comprehensive All Content Navigation Menu
 * Organized mega menu with all platform sections
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Home,
  Video,
  MessageCircle,
  Heart,
  ShoppingBag,
  Sparkles,
  Swords,
  Wrench,
  TrendingUp,
  Crown,
  Settings,
  Info,
  Users,
  Zap,
  DollarSign,
  Camera,
  Code,
  BarChart3,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  icon: any;
  badge?: string;
  items: { label: string; path: string; new?: boolean; premium?: boolean }[];
}

export function AllContentMenu() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: "🎥 Main Feed",
      icon: Home,
      items: [
        { label: "For You Page (FYP)", path: "/" },
        { label: "Feed", path: "/feed" },
        { label: "Explore", path: "/explore" },
        { label: "Search", path: "/search" },
        { label: "Trending News", path: "/trending" },
      ],
    },
    {
      title: "🔥 Premium Adult Content",
      icon: Crown,
      badge: "HOT",
      items: [
        { label: "OnlyFans AI Creators", path: "/onlyfans", new: true, premium: true },
        { label: "Premium Models", path: "/models", premium: true },
        { label: "Live Hosts", path: "/live-hosts", premium: true },
        { label: "Private Shows", path: "/live", premium: true },
      ],
    },
    {
      title: "💬 Social & Messaging",
      icon: MessageCircle,
      items: [
        { label: "Messages (WhatsApp Style)", path: "/messages" },
        { label: "Inbox", path: "/inbox" },
        { label: "WhatsApp", path: "/whatsapp" },
        { label: "Instagram", path: "/instagram" },
        { label: "YouTube", path: "/youtube" },
        { label: "Snapchat", path: "/snapchat" },
        { label: "Discord/Communities", path: "/discord" },
        { label: "Calls", path: "/calls" },
      ],
    },
    {
      title: "🎬 Create Content",
      icon: Camera,
      items: [
        { label: "Upload Video", path: "/upload" },
        { label: "Sora 2 AI Generator", path: "/sora", new: true },
        { label: "Video Generator", path: "/video-generator" },
        { label: "Creator Studio", path: "/creator-studio" },
        { label: "Creator Studio Pro", path: "/creator-studio-pro", premium: true },
        { label: "AI Workspace", path: "/ai-workspace" },
        { label: "Code Workspace", path: "/workspace" },
      ],
    },
    {
      title: "💕 Dating & Love",
      icon: Heart,
      items: [
        { label: "Love Connection", path: "/love" },
        { label: "Dating Swipe (Rizz)", path: "/dating" },
      ],
    },
    {
      title: "🛍️ Shopping & Wallet",
      icon: ShoppingBag,
      items: [
        { label: "Marketplace", path: "/marketplace" },
        { label: "Digital Shop", path: "/shop" },
        { label: "Wallet", path: "/wallet" },
        { label: "Coins & Credits", path: "/coins" },
        { label: "Checkout", path: "/checkout" },
      ],
    },
    {
      title: "⚔️ Battle Rooms",
      icon: Swords,
      items: [
        { label: "Battle Rooms", path: "/battles" },
        { label: "Live Battles", path: "/live-battles" },
      ],
    },
    {
      title: "🤖 AI Tools & Bots",
      icon: Sparkles,
      items: [
        { label: "AI Hub", path: "/ai-hub" },
        { label: "AI Tools", path: "/ai-tools" },
        { label: "AI Cloner", path: "/ai-cloner" },
        { label: "AI Chat", path: "/ai-chat" },
        { label: "Marketing Bots", path: "/bots" },
        { label: "Influencer Creator", path: "/influencers/create", new: true },
      ],
    },
    {
      title: "📊 CRM & Marketing",
      icon: TrendingUp,
      badge: "ELITE",
      items: [
        { label: "Enterprise CRM", path: "/crm", new: true },
        { label: "Viral Dashboard", path: "/viral" },
        { label: "Marketing Tools", path: "/marketing" },
        { label: "Daily Nexus", path: "/daily-nexus" },
        { label: "Coming Soon Features", path: "/coming-soon" },
      ],
    },
    {
      title: "👑 Admin & Analytics",
      icon: BarChart3,
      items: [
        { label: "Admin Dashboard", path: "/admin-dashboard" },
        { label: "Admin Panel", path: "/admin" },
        { label: "Stats", path: "/stats" },
        { label: "Downloads Analysis", path: "/download-analysis" },
      ],
    },
    {
      title: "⚙️ Settings",
      icon: Settings,
      items: [
        { label: "Settings", path: "/settings" },
        { label: "Edit Profile", path: "/edit-profile" },
        { label: "Privacy Settings", path: "/settings/privacy" },
        { label: "Social Media Settings", path: "/social-media" },
        { label: "CRM Settings", path: "/crm-settings" },
        { label: "Blocked Users", path: "/blocked-users" },
      ],
    },
    {
      title: "🎁 Charity & Mission",
      icon: Gift,
      items: [
        { label: "Charity Program", path: "/charity", new: true },
        { label: "About PROFITHACK AI", path: "/about" },
        { label: "Features", path: "/features" },
        { label: "How It Works", path: "/how-it-works" },
      ],
    },
    {
      title: "ℹ️ Info & Legal",
      icon: Info,
      items: [
        { label: "Pricing", path: "/pricing" },
        { label: "Blog", path: "/blog" },
        { label: "Careers", path: "/careers" },
        { label: "API Docs", path: "/api" },
        { label: "Terms of Service", path: "/terms" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Refund Policy", path: "/refund" },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover-elevate active-elevate-2"
          data-testid="button-all-content-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[90vw] sm:w-[400px] bg-black/95 backdrop-blur-lg border-r border-cyan-500/30"
      >
        <SheetHeader className="border-b border-cyan-500/30 pb-4">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            PROFITHACK AI
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Navigate to any section • {navSections.reduce((acc, section) => acc + section.items.length, 0)} pages available
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <div className="space-y-6">
            {navSections.map((section) => {
              const SectionIcon = section.icon;
              
              return (
                <div key={section.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SectionIcon className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">
                      {section.title}
                    </h3>
                    {section.badge && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 border-pink-500 text-pink-400"
                      >
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 pl-6">
                    {section.items.map((item) => {
                      const isActive = location === item.path;
                      
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover-elevate active-elevate-2",
                            isActive
                              ? "bg-cyan-500/20 text-cyan-400 font-medium"
                              : "text-gray-300 hover:text-white"
                          )}
                          data-testid={`menu-item-${item.path.slice(1) || 'home'}`}
                        >
                          <span>{item.label}</span>
                          <div className="flex items-center gap-1">
                            {item.new && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-green-500 text-green-400">
                                NEW
                              </Badge>
                            )}
                            {item.premium && (
                              <Crown className="w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
