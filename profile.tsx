/**
 * PROFITHACK AI - TikTok-Style User Profile Page
 * Exact TikTok profile replica with proper data fetching
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Link as LinkIcon,
  Phone,
  Mail,
  Grid3x3,
  Lock,
  Repeat2,
  Bookmark,
  Heart,
  Play,
  Video,
  Briefcase,
  Radio,
  Plus,
  Menu,
  Sparkles,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type TabType = "grid" | "private" | "reposts" | "saved" | "likes";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:username");
  const [, setNavLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("grid");
  
  // Get username from route params OR current user
  const username = params?.username || currentUser?.username;

  // Fetch user profile by username
  const { data: profile, isLoading: profileLoading } = useQuery<any>({
    queryKey: ['/api/users/profile', username],
    enabled: !!username,
  });

  // Fetch user's videos
  const { data: videos = [], isLoading: videosLoading } = useQuery<any[]>({
    queryKey: ['/api/videos', { userId: profile?.id }],
    enabled: !!profile?.id,
  });

  const isOwnProfile = currentUser?.id === profile?.id || currentUser?.username === username;

  // Format numbers TikTok-style
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </div>
    );
  }

  // If no profile and no username, show own profile placeholder
  if (!profile && !username) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-white text-3xl">
            ?
          </AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold text-black dark:text-white mb-2">Not logged in</h2>
        <p className="text-gray-500 text-sm mb-4">Please log in to view your profile</p>
        <Button onClick={() => setNavLocation('/login')} data-testid="button-login">
          Log In
        </Button>
      </div>
    );
  }

  // User not found
  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center">
        <div className="text-gray-500 text-lg mb-2">User not found</div>
        <p className="text-gray-400 text-sm">@{username}</p>
      </div>
    );
  }

  const tabs: { id: TabType; icon: any }[] = [
    { id: "grid", icon: Grid3x3 },
    { id: "private", icon: Lock },
    { id: "reposts", icon: Repeat2 },
    { id: "saved", icon: Bookmark },
    { id: "likes", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24 overflow-y-auto">
      {/* Top Header Bar - TikTok Style */}
      <div className="sticky top-0 z-20 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-12">
          {/* Left - Add Friend */}
          <button className="p-2" data-testid="button-add-friend">
            <UserPlus className="w-5 h-5 text-black dark:text-white" />
          </button>

          {/* Center - Username dropdown */}
          <button className="flex items-center gap-1" data-testid="button-username">
            <span className="font-semibold text-black dark:text-white">
              @{profile.username}
            </span>
            <ChevronDown className="w-4 h-4 text-black dark:text-white" />
          </button>

          {/* Right - Share & Menu */}
          <div className="flex items-center">
            <button className="p-2" data-testid="button-share">
              <Share2 className="w-5 h-5 text-black dark:text-white" />
            </button>
            <button 
              className="p-2"
              onClick={() => setNavLocation('/settings')}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4">
        {/* Avatar - Large Centered with + Button */}
        <div className="flex justify-center pt-5 pb-3">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl || profile.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-white text-3xl font-bold">
                {profile.name?.[0] || profile.username?.[0] || "P"}
              </AvatarFallback>
            </Avatar>
            {/* Add photo button overlay */}
            <button 
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-3 border-white dark:border-black shadow-lg"
              data-testid="button-change-photo"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Name + Verified Badge + Edit Button */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-lg font-bold text-black dark:text-white">
            {profile.name || profile.username}
          </h1>
          {profile.verified && (
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 ml-1 text-xs rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
              onClick={() => setNavLocation('/edit-profile')}
              data-testid="button-edit"
            >
              Edit
            </Button>
          )}
        </div>

        {/* Username Handle */}
        <p className="text-center text-sm text-gray-500 mb-4">
          @{profile.username}
        </p>

        {/* Stats Row - Following | Followers | Friends */}
        <div className="flex justify-center gap-5 mb-4">
          <button className="text-center" data-testid="stat-following">
            <div className="text-lg font-bold text-black dark:text-white">
              {formatNumber(profile.followingCount || 0)}
            </div>
            <div className="text-xs text-gray-500">Following</div>
          </button>
          <button className="text-center" data-testid="stat-followers">
            <div className="text-lg font-bold text-black dark:text-white">
              {formatNumber(profile.followersCount || 0)}
            </div>
            <div className="text-xs text-gray-500">Followers</div>
          </button>
          <button className="text-center" data-testid="stat-friends">
            <div className="text-lg font-bold text-black dark:text-white">
              {formatNumber(profile.friendsCount || 0)}
            </div>
            <div className="text-xs text-gray-500">Friends</div>
          </button>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="text-center text-sm text-black dark:text-white mb-3 px-6 whitespace-pre-wrap">
            {profile.bio}
          </div>
        )}

        {/* Website Link */}
        {profile.websiteUrl && (
          <div className="flex justify-center mb-3">
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-black dark:text-white"
              data-testid="link-website"
            >
              <LinkIcon className="w-4 h-4" />
              <span className="underline">{profile.websiteUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          </div>
        )}

        {/* Phone & Email - Pink */}
        <div className="flex justify-center gap-6 mb-4">
          <button className="flex items-center gap-1 text-pink-500" data-testid="button-phone">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Phone</span>
          </button>
          <button className="flex items-center gap-1 text-pink-500" data-testid="button-email">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Email</span>
          </button>
        </div>

        {/* Creator Tools Row - Pink Icons */}
        <div className="flex justify-center items-center gap-4 mb-5 flex-wrap">
          <button 
            className="flex items-center gap-1"
            onClick={() => setNavLocation('/creator-studio')}
            data-testid="button-studio"
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-black dark:text-white">TikTok Studio</span>
          </button>
          <button 
            className="flex items-center gap-1"
            onClick={() => setNavLocation('/crm')}
            data-testid="button-business"
          >
            <Briefcase className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-black dark:text-white">Business Suite</span>
          </button>
          <button 
            className="flex items-center gap-1"
            onClick={() => setNavLocation('/go-live')}
            data-testid="button-golive"
          >
            <Radio className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-black dark:text-white">LIVE</span>
          </button>
          <button data-testid="button-more-tools">
            <Sparkles className="w-4 h-4 text-pink-500" />
          </button>
        </div>
      </div>

      {/* Content Tabs - Icon only */}
      <div className="sticky top-12 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-3 flex items-center justify-center",
                  isActive 
                    ? "border-b-2 border-black dark:border-white" 
                    : "border-b-2 border-transparent"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-black dark:text-white" : "text-gray-400"
                )} />
                {tab.id === "grid" && (
                  <ChevronDown className={cn(
                    "w-3 h-3 ml-0.5",
                    isActive ? "text-black dark:text-white" : "text-gray-400"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-3 gap-0.5">
          {videosLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-100 dark:bg-gray-900 animate-pulse" />
            ))
          ) : videos.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20">
              <Video className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500 text-sm">No videos yet</p>
              <p className="text-gray-400 text-xs mt-1">Your videos will appear here</p>
            </div>
          ) : (
            videos.map((video: any, index: number) => (
              <button
                key={video.id}
                onClick={() => setNavLocation(`/video/${video.id}`)}
                className="relative aspect-[9/16] bg-gray-100 dark:bg-gray-900 overflow-hidden"
                data-testid={`video-${video.id}`}
              >
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={video.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
                )}
                
                {/* Pinned label */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Pinned
                  </div>
                )}
                
                {/* View count */}
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatNumber(video.views || 0)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Other tabs - empty states */}
      {activeTab === "private" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Lock className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">Private videos</p>
        </div>
      )}
      {activeTab === "reposts" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Repeat2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">Reposts</p>
        </div>
      )}
      {activeTab === "saved" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">Saved</p>
        </div>
      )}
      {activeTab === "likes" && (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">Likes</p>
        </div>
      )}
    </div>
  );
}
