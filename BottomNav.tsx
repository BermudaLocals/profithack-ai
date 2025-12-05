import { Home, Sparkles, Plus, MessageCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/fyp", isCreate: false },
    { icon: Sparkles, label: "Discover", path: "/search", isCreate: false },
    { icon: Plus, label: "", path: "/camera", isCreate: true },
    { icon: MessageCircle, label: "Inbox", path: "/messages", isCreate: false },
    { icon: User, label: "Profile", path: "/profile", isCreate: false },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/10 md:hidden"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.path && location === item.path;

          // Special TikTok-style Create button
          if (item.isCreate) {
            return (
              <button
                key="create"
                onClick={() => setLocation(item.path)}
                className="relative flex items-center justify-center -mt-4"
                data-testid="button-nav-create"
              >
                {/* Gradient background layers */}
                <div className="absolute w-12 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 -left-1" />
                <div className="absolute w-12 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 -right-1" />
                
                {/* White center with + icon */}
                <div className="relative w-11 h-8 rounded-lg bg-white flex items-center justify-center z-10">
                  <Plus className="w-5 h-5 text-black" strokeWidth={3} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => item.path && setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all",
                isActive ? "text-white" : "text-gray-500"
              )}
              data-testid={`button-nav-${item.label.toLowerCase()}`}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-all",
                  isActive ? "scale-110" : "scale-100"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
