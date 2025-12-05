/**
 * TikTok-Style Search Page
 * Search for videos, users, sounds, and hashtags
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, TrendingUp, Play, User, Music, Hash, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SearchTab = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "viral dance", "funny cats", "cooking recipes", "fitness tips"
  ]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', query, activeTab],
    enabled: query.length > 0,
  });

  const trendingSearches = [
    { term: "#ViralChallenge2025", count: "2.4M posts", icon: Hash },
    { term: "AI Videos", count: "892K views", icon: TrendingUp },
    { term: "Sora 2 Tutorial", count: "445K views", icon: Play },
    { term: "@creator_pro", count: "1.2M followers", icon: User },
    { term: "Trending Sound Mix", count: "3.1M uses", icon: Music },
  ];

  const tabs: { id: SearchTab; label: string; icon: any }[] = [
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: User },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'sounds', label: 'Sounds', icon: Music },
    { id: 'hashtags', label: 'Hashtags', icon: Hash },
  ];

  const clearSearch = () => {
    setQuery("");
  };

  const handleSearch = (term: string) => {
    setQuery(term);
    if (!searchHistory.includes(term)) {
      setSearchHistory([term, ...searchHistory.slice(0, 9)]);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-black border-b border-gray-800">
        <div className="p-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos, users, sounds..."
              className="pl-12 pr-12 h-12 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 rounded-full"
              data-testid="input-search"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-full transition-colors"
                data-testid="button-clear-search"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Tabs */}
          {query && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                      isActive
                        ? "bg-white text-black font-semibold"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {!query ? (
          <div className="p-4 space-y-6">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Recent Searches</h3>
                  <button
                    onClick={() => setSearchHistory([])}
                    className="text-gray-400 text-sm hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-900 rounded-lg transition-colors"
                      data-testid={`recent-${index}`}
                    >
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-white text-left flex-1">{term}</span>
                      <X 
                        className="w-4 h-4 text-gray-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchHistory(searchHistory.filter((_, i) => i !== index));
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                Trending Now
              </h3>
              <div className="space-y-2">
                {trendingSearches.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSearch(item.term)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-900 rounded-lg transition-colors"
                      data-testid={`trending-${index}`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">{item.term}</p>
                        <p className="text-gray-400 text-xs">{item.count}</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-pink-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">Search for "{query}"</p>
                <p className="text-gray-600 text-sm mt-2">Videos, users, sounds, and hashtags</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
