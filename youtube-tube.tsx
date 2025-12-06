/**
 * YouTube-Style Tube Section
 * EXACT YouTube UI with PROFITHACK branding
 * Features: Home, Shorts, Subscriptions, Library
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Home,
  PlaySquare,
  Plus,
  Radio,
  Library,
  Search,
  Mic,
  Bell,
  User as UserIcon,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  ListPlus,
  Flag,
  CheckCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockVideos = [
  {
    id: '1',
    title: 'How I Made $50K with AI Video Generation in 30 Days',
    channel: 'AI Money Maker',
    avatar: '',
    views: '2.4M',
    timeAgo: '2 days ago',
    duration: '12:34',
    verified: true,
  },
  {
    id: '2',
    title: 'Sora 2 Tutorial - Complete Beginner Guide 2025',
    channel: 'Tech Academy',
    avatar: '',
    views: '892K',
    timeAgo: '1 week ago',
    duration: '24:15',
    verified: true,
  },
  {
    id: '3',
    title: 'My Morning Routine as a Content Creator',
    channel: 'Sarah Creates',
    avatar: '',
    views: '445K',
    timeAgo: '3 days ago',
    duration: '8:47',
    verified: false,
  },
  {
    id: '4',
    title: '10 AI Tools That Will Replace Your Job',
    channel: 'Future Tech',
    avatar: '',
    views: '1.2M',
    timeAgo: '5 days ago',
    duration: '15:22',
    verified: true,
  },
];

const mockShorts = [
  { id: '1', title: 'Viral Dance Challenge', views: '5.2M' },
  { id: '2', title: 'AI Art in 30 Seconds', views: '3.1M' },
  { id: '3', title: 'Life Hack You Need', views: '2.8M' },
  { id: '4', title: 'Coding Meme', views: '1.9M' },
];

export default function YouTubeTube() {
  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'subscriptions' | 'library'>('home');

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      {/* YouTube Header */}
      <div className="sticky top-0 z-40 bg-[#0f0f0f] border-b border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                <PlaySquare className="w-5 h-5 text-white" />
              </div>
              PROFITHACK
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-800 p-2 rounded-full transition-colors">
              <Search className="w-6 h-6 text-white" />
            </button>
            <button className="hover:bg-gray-800 p-2 rounded-full transition-colors relative">
              <Bell className="w-6 h-6 text-white" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-pink-600 rounded-full" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm">
                Y
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-[57px] z-30 bg-[#0f0f0f] border-b border-gray-800">
        <div className="flex overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              "px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === 'home' ? "text-white" : "text-gray-400"
            )}
          >
            Home
            {activeTab === 'home' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            className={cn(
              "px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === 'shorts' ? "text-white" : "text-gray-400"
            )}
          >
            Shorts
            {activeTab === 'shorts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              "px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === 'subscriptions' ? "text-white" : "text-gray-400"
            )}
          >
            Subscriptions
            {activeTab === 'subscriptions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === 'library' ? "text-white" : "text-gray-400"
            )}
          >
            Library
            {activeTab === 'library' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Shorts Section */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <PlaySquare className="w-6 h-6 text-pink-500" />
                Shorts
              </h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {mockShorts.map((short) => (
                  <div key={short.id} className="flex-shrink-0 w-40">
                    <div className="aspect-[9/16] bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl flex items-center justify-center mb-2">
                      <PlaySquare className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-white text-sm font-medium line-clamp-2">{short.title}</p>
                    <p className="text-gray-400 text-xs">{short.views} views</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div className="space-y-4">
              {mockVideos.map((video) => (
                <div key={video.id} className="flex gap-3" data-testid={`video-${video.id}`}>
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-40 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                    <PlaySquare className="w-10 h-10 text-gray-600" />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-white text-xs font-semibold">
                      {video.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-gray-400 text-xs">{video.channel}</p>
                      {video.verified && (
                        <CheckCircle className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {video.views} views • {video.timeAgo}
                    </p>
                  </div>

                  {/* Menu */}
                  <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <PlaySquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Shorts Coming Soon</p>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Subscriptions Coming Soon</p>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Library className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Library Coming Soon</p>
            </div>
          </div>
        )}
      </div>

      {/* YouTube Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex flex-col items-center gap-1 p-2",
              activeTab === 'home' ? "text-white" : "text-gray-400"
            )}
          >
            <Home className="w-6 h-6" fill={activeTab === 'home' ? 'white' : 'none'} />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('shorts')}
            className={cn(
              "flex flex-col items-center gap-1 p-2",
              activeTab === 'shorts' ? "text-white" : "text-gray-400"
            )}
          >
            <PlaySquare className="w-6 h-6" />
            <span className="text-xs">Shorts</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <div className="w-10 h-7 bg-white rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-black" />
            </div>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              "flex flex-col items-center gap-1 p-2",
              activeTab === 'subscriptions' ? "text-white" : "text-gray-400"
            )}
          >
            <Radio className="w-6 h-6" />
            <span className="text-xs">Subs</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex flex-col items-center gap-1 p-2",
              activeTab === 'library' ? "text-white" : "text-gray-400"
            )}
          >
            <Library className="w-6 h-6" />
            <span className="text-xs">Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
