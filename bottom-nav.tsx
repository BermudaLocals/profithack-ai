import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { 
  Home, 
  Heart, 
  PlusSquare, 
  MessageCircle,
  Wallet,
  User,
  Flame,
  Crown,
  Sparkles,
  Inbox,
  Bot,
  Video,
  Camera,
  X,
  Radio
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export function BottomNav() {
  const [location] = useLocation();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // TikTok-style bottom nav: Home | Inbox | + | AI | Profile
  const mainNavItems = [
    { path: '/feed', icon: Home, label: 'Home', testId: 'nav-home' },
    { path: '/inbox', icon: Inbox, label: 'Inbox', testId: 'nav-inbox', hasBadge: true },
    { path: '#create', icon: PlusSquare, label: '', testId: 'nav-create', isCenter: true },
    { path: '/ai-chat', icon: Bot, label: 'AI', testId: 'nav-ai' },
    { path: '/profile', icon: User, label: 'Profile', testId: 'nav-profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/feed') {
      return location === '/' || location === '/feed' || location === '/fyp';
    }
    if (path === '/profile') {
      return location === '/profile' || location.startsWith('/profile/');
    }
    if (path === '/inbox') {
      return location === '/inbox' || location === '/messages' || location.startsWith('/messages/');
    }
    return location === path || location.startsWith(path + '/');
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (path === '#create') {
      e.preventDefault();
      setShowCreateMenu(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800">
        <div className="flex items-center justify-around h-[50px] px-1 max-w-screen-xl mx-auto">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            // Center create button (TikTok style with gradient)
            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  data-testid={item.testId}
                  className="flex flex-col items-center justify-center flex-1 h-full"
                >
                  <div className="relative -mt-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg blur-sm opacity-75" />
                    <div className="relative w-11 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
                    </div>
                  </div>
                </button>
              );
            }
            
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                data-testid={item.testId}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  active
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 mb-0.5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
                  />
                  {(item as any).hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-normal">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Create Menu Modal */}
      <Dialog open={showCreateMenu} onOpenChange={setShowCreateMenu}>
        <DialogContent className="bg-black/95 border-gray-800 max-w-xs p-0 rounded-3xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-bold">Create</h3>
              <button 
                onClick={() => setShowCreateMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/upload"
                onClick={() => setShowCreateMenu(false)}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl hover:from-pink-500/30 hover:to-purple-500/30 transition-colors"
                data-testid="create-post"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-semibold">Post</span>
                <span className="text-gray-400 text-xs mt-1">Share video</span>
              </a>
              
              <a
                href="/go-live"
                onClick={() => setShowCreateMenu(false)}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl hover:from-red-500/30 hover:to-orange-500/30 transition-colors"
                data-testid="create-live"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Radio className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-semibold">LIVE</span>
                <span className="text-gray-400 text-xs mt-1">Go live now</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
