import { TrendingTopics } from "@/components/viral/trending-topics";
import { ShareProgress } from "@/components/viral/share-progress";
import { ViralContentGenerator } from "@/components/viral/content-generator";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, TrendingUp, Share2, Award, Zap, Sparkles, Target } from "lucide-react";
import type { SocialShare, ViralKeyword } from "@shared/schema";

export default function ViralDashboard() {
  const { data: shares } = useQuery<SocialShare[]>({
    queryKey: ["/api/viral/my-shares"],
  });

  const { data: keywords } = useQuery<ViralKeyword[]>({
    queryKey: ["/api/viral/keywords"],
  });

  // Calculate total credits earned from sharing
  const totalShareCredits = shares?.reduce((sum, share) => sum + (share.earnedCredits || 0), 0) || 0;
  const totalShares = shares?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-viral-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Viral Marketing Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Build in public, ride viral waves, and grow your audience fast 🚀
          </p>
        </div>
        <ShareProgress />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-shares">
              {totalShares}
            </div>
            <p className="text-xs text-muted-foreground">Building in public</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-credits-earned">
              {totalShareCredits}
            </div>
            <p className="text-xs text-muted-foreground">From social shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-viral-score">
              {Math.min(100, totalShares * 10)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" data-testid="tab-generator">
            <Sparkles className="h-4 w-4 mr-2" />
            Content Generator
          </TabsTrigger>
          <TabsTrigger value="trending" data-testid="tab-trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending Topics
          </TabsTrigger>
          <TabsTrigger value="keywords" data-testid="tab-keywords">
            <Target className="h-4 w-4 mr-2" />
            SEO Keywords
          </TabsTrigger>
        </TabsList>

        {/* Content Generator Tab */}
        <TabsContent value="generator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ViralContentGenerator />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Based on Viral Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 text-muted-foreground">
                  <p>✅ <strong>Simpsons Prediction Format</strong> - Classic viral hook</p>
                  <p>✅ <strong>Text Story Drama</strong> - Musa's favorite niche</p>
                  <p>✅ <strong>Reddit Confessions</strong> - High retention format</p>
                  <p>✅ <strong>Show vs Show Battles</strong> - Engagement bait</p>
                  <p className="pt-2 border-t">
                    These templates are proven to generate millions of views. Just add your twist!
                  </p>
                </CardContent>
              </Card>
              
              {/* Existing Share History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Build in Public Rewards
                  </CardTitle>
                  <CardDescription>Earn bonus credits for sharing your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Share Progress Update</span>
                      <Badge variant="secondary">+50 credits</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Share Milestone</span>
                      <Badge variant="secondary">+50 credits</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Share Video</span>
                      <Badge variant="secondary">+50 credits</Badge>
                    </div>
                  </div>
                  
                  <ShareProgress />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Trending Topics Tab */}
        <TabsContent value="trending" className="mt-6">
          <TrendingTopics />
        </TabsContent>

        {/* SEO Keywords Tab */}
        <TabsContent value="keywords" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Target Keywords for Viral Videos
              </CardTitle>
              <CardDescription>
                Rank for the same keywords as viral shorts - sorted by opportunity score
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!keywords || keywords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No keywords tracked yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keywords.map((keyword) => (
                    <Card key={keyword.id} className="hover-elevate" data-testid={`keyword-${keyword.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{keyword.keyword}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {keyword.searchVolume?.toLocaleString()} monthly searches
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={
                                keyword.opportunityScore && keyword.opportunityScore >= 80
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {keyword.opportunityScore}% opportunity
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {keyword.competition} competition
                            </Badge>
                            {keyword.trendingStatus === "rising" && (
                              <Badge variant="default" className="text-xs">
                                📈 Rising
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Keep existing sidebar below main tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"></div>

        <div className="space-y-6">
          {/* Recent Shares */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shares</CardTitle>
              <CardDescription>Your building in public activity</CardDescription>
            </CardHeader>
            <CardContent>
              {!shares || shares.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Share2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No shares yet</p>
                  <p className="text-xs mt-1">Start building in public!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shares.slice(0, 5).map((share) => (
                    <div
                      key={share.id}
                      className="border rounded-lg p-3 text-sm"
                      data-testid={`share-item-${share.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {share.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(share.sharedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {share.shareText}
                      </p>
                      {share.earnedCredits && share.earnedCredits > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            +{share.earnedCredits} credits
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Viral Marketing Tips from the Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">📈 Be First to Market</h4>
              <p className="text-sm text-muted-foreground">
                Jump on trending topics within 24-48 hours. Use the trending dashboard to spot viral waves early.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎣 Hook Everything</h4>
              <p className="text-sm text-muted-foreground">
                Your first 3 seconds decide everything. Add context, challenge beliefs, create curiosity gaps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏗️ Build in Public</h4>
              <p className="text-sm text-muted-foreground">
                Share every milestone, every win, every lesson. Building in public creates anticipation and trust.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔁 Viral Loops</h4>
              <p className="text-sm text-muted-foreground">
                Share your progress on X/Twitter, get engagement, convert to signups. Each share = potential viral moment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
