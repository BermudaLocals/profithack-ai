/**
 * PROFITHACK AI - YouTube Clone
 * EXACT YouTube UI with Home, Shorts, Subscriptions
 */

import { useState } from "react";
import { Search, Mic, Bell, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface VideoCard {
  id: string;
  title: string;
  channel: string;
  views: string;
  time: string;
  thumbnail: string;
  duration: string;
}

export default function YouTubePage() {
  const [activeTab, setActiveTab] = useState<"home" | "shorts" | "subscriptions">("home");

  const videos: VideoCard[] = [
    {
      id: "1",
      title: "Amazing Mountain Hiking Adventure",
      channel: "Travel Explorer",
      views: "1.2M views",
      time: "2 days ago",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      duration: "15:42"
    },
    {
      id: "2",
      title: "How to Cook Perfect Pasta",
      channel: "Chef's Kitchen",
      views: "856K views",
      time: "1 week ago",
      thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      duration: "10:25"
    },
    {
      id: "3",
      title: "Best Tech Gadgets 2024",
      channel: "Tech Reviews",
      views: "2.5M views",
      time: "3 days ago",
      thumbnail: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400",
      duration: "22:15"
    }
  ];

  return (
    <div className="h-screen bg-[#0F0F0F] flex flex-col">
      {/* YouTube Header */}
      <div className="bg-[#0F0F0F] px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Video className="w-8 h-8 text-red-600" />
            <span className="text-white text-xl font-semibold">YouTube</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors" data-testid="button-search" />
          <Mic className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors" data-testid="button-voice-search" />
          <Bell className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition-colors" data-testid="button-notifications" />
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-sm">U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0F0F0F] px-4 flex gap-8 border-b border-gray-800 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("home")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
            activeTab === "home" ? "text-white" : "text-gray-400"
          )}
          data-testid="tab-home"
        >
          Home
          {activeTab === "home" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("shorts")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
            activeTab === "shorts" ? "text-white" : "text-gray-400"
          )}
          data-testid="tab-shorts"
        >
          Shorts
          {activeTab === "shorts" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={cn(
            "py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
            activeTab === "subscriptions" ? "text-white" : "text-gray-400"
          )}
          data-testid="tab-subscriptions"
        >
          Subscriptions
          {activeTab === "subscriptions" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "home" && (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                data-testid={`video-${video.id}`}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-white text-xs font-semibold">
                    {video.duration}
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-sm">
                      {video.channel[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-xs">{video.channel}</p>
                    <p className="text-gray-400 text-xs">
                      {video.views} • {video.time}
                    </p>
                  </div>
                  <MoreVertical className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shorts" && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Shorts coming soon</p>
          </div>
        )}

        {activeTab === "subscriptions" && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No subscriptions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
