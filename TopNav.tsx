/**
 * PROFITHACK AI - Top Navigation Bar
 * Comprehensive navigation with OnlyFans AI Creators section
 */

import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { AllContentMenu } from "./AllContentMenu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Crown,
  Heart,
  Sparkles,
  MessageCircle,
  Settings,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const quickAccessButtons = [
    {
      icon: Crown,
      label: "AI Creators",
      path: "/onlyfans",
      badge: "HOT",
      premium: true,
      color: "from-pink-500 to-orange-500",
    },
    {
      icon: Search,
      label: "Search",
      path: "/search",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/inbox",
      count: 12,
    },
    {
      icon: MessageCircle,
      label: "Messages",
      path: "/messages",
      count: 5,
    },
    {
      icon: Video,
      label: "Create",
      path: "/upload",
      highlight: true,
    },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-cyan-500/30"
      data-testid="nav-top"
    >
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <AllContentMenu />
          
          <button
            onClick={() => setLocation("/home-launcher")}
            className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-1.5 rounded-lg transition-all"
            data-testid="button-logo"
          >
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              PROFITHACK AI
            </span>
          </button>
        </div>

        {/* Center: Quick Access (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {quickAccessButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = location === btn.path;
            
            return (
              <Button
                key={btn.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setLocation(btn.path)}
                className={cn(
                  "relative hover-elevate active-elevate-2 gap-2",
                  btn.premium && "bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700",
                  btn.highlight && "bg-cyan-600 hover:bg-cyan-700"
                )}
                data-testid={`button-nav-${btn.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{btn.label}</span>
                
                {btn.badge && (
                  <Badge
                    variant="outline"
                    className="absolute -top-1 -right-1 text-[9px] px-1 py-0 h-3.5 border-yellow-500 text-yellow-400 bg-black"
                  >
                    {btn.badge}
                  </Badge>
                )}
                
                {btn.count && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 text-[9px] px-1 py-0 h-3.5 min-w-[14px] flex items-center justify-center"
                  >
                    {btn.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setLocation("/profile")}
              className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-lg transition-all"
              data-testid="button-user-profile"
            >
              <Avatar className="w-8 h-8 border-2 border-cyan-500">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-white">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-white">
                {user.username || "User"}
              </span>
            </button>
          ) : (
            <Button
              onClick={() => setLocation("/login")}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700"
              data-testid="button-login"
            >
              Log In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Quick Access (Bottom of TopNav) */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
        {quickAccessButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = location === btn.path;
          
          return (
            <button
              key={btn.path}
              onClick={() => setLocation(btn.path)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all hover-elevate active-elevate-2 text-sm",
                isActive
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-gray-800/50 text-gray-300",
                btn.premium && isActive && "bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-pink-400"
              )}
              data-testid={`button-mobile-${btn.label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon className="w-4 h-4" />
              <span>{btn.label}</span>
              
              {btn.badge && (
                <Badge
                  variant="outline"
                  className="text-[8px] px-1 py-0 h-3 border-yellow-500 text-yellow-400"
                >
                  {btn.badge}
                </Badge>
              )}
              
              {btn.count && btn.count > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[8px] px-1 py-0 h-3 min-w-[12px]"
                >
                  {btn.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
