import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Eye, Heart, MessageCircle, Users, Video, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type AnalyticsData = {
  earnings: {
    total: number;
    pending: number;
    paid: number;
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagementRate: number;
  };
  growth: {
    followers: number;
    newFollowers: number;
    followerGrowth: number;
    videoCount: number;
  };
  chartData: {
    earningsChart: Array<{ date: string; earnings: number; views: number }>;
    engagementChart: Array<{ date: string; likes: number; comments: number; shares: number }>;
  };
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    earnings: number;
    createdAt: string;
  }>;
};

export default function Stats() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/creator"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const earnings = analytics?.earnings || {
    total: 0,
    pending: 0,
    paid: 0,
    thisWeek: 0,
    lastWeek: 0,
    growth: 0,
  };

  const engagement = analytics?.engagement || {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    avgEngagementRate: 0,
  };

  const growth = analytics?.growth || {
    followers: 0,
    newFollowers: 0,
    followerGrowth: 0,
    videoCount: 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Creator Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your earnings, growth, and engagement
            </p>
          </div>
          <Badge variant="default" className="h-8">
            48% Revenue Share
          </Badge>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-earnings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-earnings">
                {formatCurrency(earnings.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={earnings.growth >= 0 ? "text-green-500" : "text-red-500"}>
                  {earnings.growth >= 0 ? "+" : ""}
                  {earnings.growth.toFixed(1)}%
                </span>{" "}
                from last week
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-earnings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-earnings">
                {formatCurrency(earnings.pending)}
              </div>
              <p className="text-xs text-muted-foreground">Payout in 14 days</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-views">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-views">
                {formatNumber(engagement.totalViews)}
              </div>
              <p className="text-xs text-muted-foreground">
                {engagement.avgEngagementRate.toFixed(1)}% engagement rate
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-followers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-followers">
                {formatNumber(growth.followers)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{growth.newFollowers}</span> this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="earnings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="videos" data-testid="tab-videos">
              Top Videos
            </TabsTrigger>
          </TabsList>

          {/* Earnings Chart */}
          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings & Views (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.chartData.earningsChart || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="earnings"
                      stroke="#ec4899"
                      strokeWidth={2}
                      name="Earnings ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="views"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      name="Views"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Chart */}
          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.chartData.engagementChart || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="likes" fill="#ec4899" name="Likes" />
                    <Bar dataKey="comments" fill="#a855f7" name="Comments" />
                    <Bar dataKey="shares" fill="#22d3ee" name="Shares" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Videos */}
          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topVideos && analytics.topVideos.length > 0 ? (
                    analytics.topVideos.map((video, index) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover-elevate"
                        data-testid={`video-${video.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="text-2xl font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{video.title}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(video.views)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {formatNumber(video.likes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrency(video.earnings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No videos yet</p>
                      <p className="text-sm mt-1">Upload your first video to see stats</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                <div className="text-2xl font-bold">{formatNumber(engagement.totalLikes)}</div>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{formatNumber(engagement.totalComments)}</div>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
                <div className="text-2xl font-bold">{formatNumber(engagement.totalShares)}</div>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{growth.videoCount}</div>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
