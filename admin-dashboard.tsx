import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Video, DollarSign, Users, Code, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const baseUrl = window.location.origin;

  const stats = [
    {
      title: "Total Users",
      value: "3",
      description: "Registered accounts",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Invite Codes Used",
      value: "1",
      description: "Out of 2,006 total codes",
      icon: Code,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Available Codes",
      value: "2,005",
      description: "Ready to distribute",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Videos Created",
      value: "1,670",
      description: "Mostly bot-generated",
      icon: Video,
      color: "from-orange-500 to-red-500"
    }
  ];

  const links = [
    {
      title: "View All Videos",
      description: "Browse the complete video library",
      url: `${baseUrl}/videos`,
      icon: Video,
      color: "from-pink-500 to-purple-600"
    },
    {
      title: "Reels Feed (TikTok-style)",
      description: "Vertical short-form video feed",
      url: `${baseUrl}/reels`,
      icon: Video,
      color: "from-purple-500 to-indigo-600"
    },
    {
      title: "For You Feed",
      description: "Algorithm-recommended videos",
      url: `${baseUrl}/for-you`,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Marketplace",
      description: "Plugins, tools, and digital products",
      url: `${baseUrl}/marketplace`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Video Generator",
      description: "Crayo-style viral video creator",
      url: `${baseUrl}/video-generator`,
      icon: Video,
      color: "from-orange-500 to-red-600"
    }
  ];

  const apiEndpoints = [
    {
      title: "Videos API",
      endpoint: "/api/videos",
      method: "GET",
      description: "Get all videos with pagination"
    },
    {
      title: "Reels API",
      endpoint: "/api/videos/reels",
      method: "GET",
      description: "Get short-form vertical videos"
    },
    {
      title: "Ads API",
      endpoint: "/api/ads",
      method: "GET",
      description: "Get active advertisements"
    },
    {
      title: "Marketplace API",
      endpoint: "/api/marketplace/products",
      method: "GET",
      description: "Get marketplace products"
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          System overview and quick access links
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Code Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Codes</div>
              <div className="text-2xl font-bold">2,006</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="text-sm text-muted-foreground">Used Codes</div>
              <div className="text-2xl font-bold text-green-500">1</div>
              <div className="text-xs text-muted-foreground mt-1">1 unique user activated</div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <div className="text-sm text-muted-foreground">Available Codes</div>
              <div className="text-2xl font-bold text-blue-500">2,005</div>
              <div className="text-xs text-muted-foreground mt-1">Ready for distribution</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg hover-elevate active-elevate-2 bg-card border"
              data-testid={`link-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${link.color}`}>
                  <link.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{link.title}</div>
                  <div className="text-sm text-muted-foreground">{link.description}</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiEndpoints.map((endpoint, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-mono bg-blue-500/20 text-blue-400 rounded">
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm">{endpoint.endpoint}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${baseUrl}${endpoint.endpoint}`, '_blank')}
                data-testid={`button-test-${endpoint.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <span className="text-sm">Server Status</span>
            <span className="text-sm font-medium text-green-500">✅ Online</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <span className="text-sm">Database</span>
            <span className="text-sm font-medium text-green-500">✅ Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <span className="text-sm">Marketing Bots</span>
            <span className="text-sm font-medium text-green-500">✅ 3 Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
            <span className="text-sm">Payment Providers</span>
            <span className="text-sm font-medium text-blue-500">7/8 Active</span>
          </div>
        </CardContent>
      </Card>

      {/* Base URL Info */}
      <Card>
        <CardHeader>
          <CardTitle>Application URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
            <div className="text-xs text-muted-foreground mb-1">Base URL</div>
            {baseUrl}
          </div>
          <div className="p-3 rounded-lg bg-muted/50 font-mono text-sm">
            <div className="text-xs text-muted-foreground mb-1">API Base</div>
            {baseUrl}/api
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
