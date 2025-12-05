import {
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { RotatingMasonicLogoCSS } from "@/components/RotatingMasonicLogo";
import profithackLogo from '@assets/../public/profithack-logo.png';

// 🔥 VIBES - TikTok-style social feed
const vibesItems = [
  {
    title: "Feed",
    url: "/feed",
    emoji: "🔥",
    color: "from-orange-500 via-red-500 to-pink-500",
  },
  {
    title: "Tube",
    url: "/tube",
    emoji: "📺",
    color: "from-red-500 via-pink-500 to-purple-500",
  },
  {
    title: "Vids",
    url: "/clickflo",
    emoji: "🎬",
    color: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    title: "Discover",
    url: "/discover",
    emoji: "🧭",
    color: "from-blue-500 via-cyan-500 to-teal-500",
  },
  {
    title: "Battles",
    url: "/battles",
    emoji: "⚔️",
    color: "from-red-500 via-orange-500 to-yellow-500",
    badge: "HOT",
  },
];

// 💬 CHAT - WhatsApp-style messaging
const chatItems = [
  {
    title: "DMs",
    url: "/messages",
    emoji: "💬",
    color: "from-green-500 via-emerald-500 to-teal-500",
  },
  {
    title: "Calls",
    url: "/calls",
    emoji: "📞",
    color: "from-green-500 via-teal-500 to-cyan-500",
  },
  {
    title: "Live",
    url: "/live",
    emoji: "📡",
    color: "from-red-500 via-pink-500 to-rose-500",
  },
  {
    title: "Blocked",
    url: "/blocked-users",
    emoji: "🚫",
    color: "from-slate-500 via-gray-500 to-zinc-500",
  },
];

// 💕 MATCH - Dating & connections
const matchItems = [
  {
    title: "Rizz",
    url: "/love",
    emoji: "💕",
    color: "from-pink-500 via-rose-500 to-red-500",
    badge: "NEW",
  },
];

// ✨ CREATE - Content creation tools
const createItems = [
  {
    title: "Upload",
    url: "/upload-video",
    emoji: "📹",
    color: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    title: "Sora AI",
    url: "/sora",
    emoji: "🎬",
    color: "from-purple-500 via-pink-500 to-cyan-500",
    badge: "HOT",
  },
  {
    title: "Edit",
    url: "/create",
    emoji: "✨",
    color: "from-pink-500 via-purple-500 to-indigo-500",
  },
];

// 🤖 AI ZONE - All AI tools
const aiItems = [
  {
    title: "AI Lab",
    url: "/workspace",
    emoji: "🚀",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    badge: "HOT",
  },
  {
    title: "AI Chat",
    url: "/ai-workspace",
    emoji: "🤖",
    color: "from-cyan-500 via-blue-500 to-indigo-500",
  },
  {
    title: "AI Tools",
    url: "/ai-tools",
    emoji: "⚡",
    color: "from-yellow-500 via-orange-500 to-red-500",
  },
  {
    title: "250+ Tools",
    url: "/tools",
    emoji: "🛠️",
    color: "from-pink-500 via-purple-500 to-cyan-500",
    badge: "NEW",
  },
];

// 💰 BAG - Money & earnings
const bagItems = [
  {
    title: "Stats",
    url: "/stats",
    emoji: "📈",
    color: "from-green-500 via-emerald-500 to-teal-500",
  },
  {
    title: "Wallet",
    url: "/wallet",
    emoji: "💰",
    color: "from-green-400 via-emerald-400 to-lime-500",
  },
  {
    title: "Coins",
    url: "/coins",
    emoji: "🪙",
    color: "from-yellow-400 via-amber-400 to-orange-500",
  },
  {
    title: "Premium",
    url: "/premium",
    emoji: "⭐",
    color: "from-amber-500 via-yellow-500 to-orange-500",
  },
  {
    title: "Models",
    url: "/premium-models",
    emoji: "👑",
    color: "from-yellow-400 via-amber-500 to-orange-500",
  },
];

// 📈 GROW - Marketing & automation
const growItems = [
  {
    title: "Bots",
    url: "/bots",
    emoji: "🤖",
    color: "from-cyan-500 via-blue-500 to-indigo-500",
  },
  {
    title: "Shop",
    url: "/marketplace",
    emoji: "🎁",
    color: "from-pink-500 via-rose-500 to-red-500",
  },
  {
    title: "Discord",
    url: "/discord",
    emoji: "👥",
    color: "from-indigo-500 via-purple-500 to-pink-500",
  },
  {
    title: "Guides",
    url: "/guides",
    emoji: "📚",
    color: "from-blue-500 via-indigo-500 to-violet-500",
  },
];

const getTierBadgeVariant = (tier: string) => {
  switch (tier) {
    case "creator":
      return "default";
    case "innovator":
      return "default";
    default:
      return "secondary";
  }
};

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-display px-2 py-4">
            <div className="flex items-center gap-3">
              <img 
                src={profithackLogo} 
                alt="PROFITHACK AI Logo" 
                className="h-12 w-auto"
                data-testid="img-sidebar-logo"
              />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/"}
                  className="group hover-elevate active-elevate-2"
                  data-testid="link-home"
                >
                  <a href="/" className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse" />
                      <span className="text-xl relative z-10 transform group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float">
                        🏠
                      </span>
                    </div>
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>🔥 Vibes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vibesItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>💬 Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>💕 Match</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {matchItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>✨ Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {createItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>🤖 AI Zone</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 transition-all duration-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>💰 Bag</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bagItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.15}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto text-xs bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse shadow-lg shadow-pink-500/50">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>📈 Grow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {growItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="group hover-elevate active-elevate-2"
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse`} />
                        <span 
                          className="text-xl relative z-10 transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-float"
                          style={{ animationDelay: `${index * 0.12}s` }}
                        >
                          {item.emoji}
                        </span>
                      </div>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {user?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/admin"}
                    className="group hover-elevate active-elevate-2"
                    data-testid="link-admin"
                  >
                    <a href="/admin" className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-all duration-300 animate-pulse" />
                        <span className="text-xl relative z-10 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-float">
                          🛡️
                        </span>
                      </div>
                      <span>Admin</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.firstName || user?.email || "User"}
                </p>
                <Badge variant={getTierBadgeVariant(user?.subscriptionTier || "explorer")} className="text-xs">
                  {user?.subscriptionTier || "explorer"}
                </Badge>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === "/settings"} data-testid="link-settings">
              <a href="/settings">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="button-logout">
              <a href="/api/logout">
                <LogOut />
                <span>Logout</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
