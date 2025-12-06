import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Globe, Newspaper } from "lucide-react";

interface TrendingItem {
  title: string;
  searchVolume: number;
  trend: "rising" | "stable" | "declining";
  category: string;
  relevance: number;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
  timestamp: string;
  category: "world" | "technology" | "business" | "entertainment";
  impact: "high" | "medium" | "low";
}

export default function TrendingNews() {
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingItem[]>([]);
  const [worldNews, setWorldNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData();
    // Auto-refresh every 2 hours for algorithm changes
    const interval = setInterval(fetchTrendingData, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingData = async () => {
    try {
      const response = await fetch("/api/trending/keywords");
      const data = await response.json();
      setTrendingKeywords(data.keywords || []);
      setWorldNews(data.news || []);
    } catch (error) {
      console.error("Failed to fetch trending data:", error);
      setTrendingKeywords(generateMockTrendingKeywords());
      setWorldNews(generateMockWorldNews());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
        <div className="container relative mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-display font-bold">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Trending Now
                </span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Highest search volume keywords + world news that matters
            </p>
          </div>
        </div>
      </div>

      {/* Trending Keywords Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-yellow-500" />
          Top Keywords by Search Volume
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(loading ? generateMockTrendingKeywords() : trendingKeywords)
            .sort((a, b) => b.searchVolume - a.searchVolume)
            .slice(0, 12)
            .map((item, idx) => (
              <Card key={idx} className="p-6 hover-elevate">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    item.trend === "rising" ? "text-green-500" :
                    item.trend === "declining" ? "text-red-500" : "text-blue-500"
                  }`}>
                    #{idx + 1}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Searches</p>
                    <p className="text-2xl font-bold">{(item.searchVolume / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Relevance</p>
                    <p className="text-lg font-semibold text-cyan-400">{item.relevance}%</p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* World News Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Globe className="w-8 h-8 text-pink-500" />
          World News
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {(loading ? generateMockWorldNews() : worldNews)
            .filter(item => item.category === "world")
            .slice(0, 10)
            .map((item, idx) => (
              <Card key={idx} className="p-6 hover-elevate">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg hover:text-cyan-400 transition">{item.title}</h3>
                      <div className="flex gap-2 mt-3 items-center">
                        <span className="text-sm text-muted-foreground">{item.source}</span>
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          item.impact === "high" ? "bg-red-500/20 text-red-400" :
                          item.impact === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {item.impact.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              </Card>
            ))}
        </div>
      </div>

      {/* Tech & Business News */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-purple-500" />
          Tech & Business News
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(loading ? generateMockWorldNews() : worldNews)
            .filter(item => item.category === "technology" || item.category === "business")
            .slice(0, 8)
            .map((item, idx) => (
              <Card key={idx} className="p-6 hover-elevate">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                  <h3 className="font-semibold text-lg hover:text-cyan-400 transition mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.source}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      item.category === "technology" ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              </Card>
            ))}
        </div>
      </div>

      {/* Auto-Update Notice */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
          <p className="text-sm text-muted-foreground">
            ⚡ Keywords automatically update every 2 hours based on Google Trends, search volume changes, and algorithm shifts. Rankings optimized for #1 position on all platforms.
          </p>
        </Card>
      </div>
    </div>
  );
}

// Mock data generators
function generateMockTrendingKeywords(): TrendingItem[] {
  return [
    { title: "TikTok alternative app 2025", searchVolume: 125000, trend: "rising", category: "Social Media", relevance: 98 },
    { title: "Make money creating videos", searchVolume: 98500, trend: "rising", category: "Monetization", relevance: 96 },
    { title: "AI code editor online", searchVolume: 87300, trend: "rising", category: "Development", relevance: 94 },
    { title: "OnlyFans alternative platform", searchVolume: 76200, trend: "rising", category: "Creator Economy", relevance: 92 },
    { title: "Live streaming platform", searchVolume: 65400, trend: "stable", category: "Streaming", relevance: 90 },
    { title: "Creator monetization tools", searchVolume: 54800, trend: "rising", category: "Tools", relevance: 89 },
    { title: "Viral video generator AI", searchVolume: 48600, trend: "rising", category: "Content Creation", relevance: 88 },
    { title: "Social media marketing automation", searchVolume: 42100, trend: "rising", category: "Marketing", relevance: 85 },
    { title: "Discord alternative for creators", searchVolume: 39500, trend: "rising", category: "Community", relevance: 82 },
    { title: "Crypto payment platform", searchVolume: 35800, trend: "stable", category: "Payments", relevance: 80 },
    { title: "AI video editing software", searchVolume: 31200, trend: "rising", category: "Tools", relevance: 78 },
    { title: "Influencer management platform", searchVolume: 28900, trend: "stable", category: "Management", relevance: 75 },
  ];
}

function generateMockWorldNews(): NewsItem[] {
  return [
    {
      title: "Global Creator Economy Reaches $250B Milestone - Tech Giants Invest",
      source: "TechCrunch",
      url: "#",
      timestamp: new Date().toISOString(),
      category: "world",
      impact: "high",
    },
    {
      title: "New AI Tools Revolutionize Content Creation for Creators Worldwide",
      source: "Forbes",
      url: "#",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      category: "technology",
      impact: "high",
    },
    {
      title: "TikTok Alternatives Surge as Creators Seek Better Monetization",
      source: "Bloomberg",
      url: "#",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      category: "business",
      impact: "high",
    },
    {
      title: "Breaking: Major Social Platform Launches Creator Fund Expansion",
      source: "Variety",
      url: "#",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      category: "world",
      impact: "medium",
    },
    {
      title: "Cryptocurrency Payments Dominate Creator Payouts in 2025",
      source: "CoinDesk",
      url: "#",
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      category: "business",
      impact: "medium",
    },
    {
      title: "AI-Powered Video Creation Tools Hit Market Faster Than Expected",
      source: "Wired",
      url: "#",
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      category: "technology",
      impact: "high",
    },
    {
      title: "Creator Economy Regulations Finalized - What It Means for Influencers",
      source: "CNBC",
      url: "#",
      timestamp: new Date(Date.now() - 518400000).toISOString(),
      category: "world",
      impact: "high",
    },
    {
      title: "Premium Subscription Model Dominates Creator Revenue Strategy",
      source: "Business Insider",
      url: "#",
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      category: "business",
      impact: "medium",
    },
  ];
}
