import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Rocket,
  TrendingUp,
  Users,
  Target,
  FileText,
  Link2,
  Search,
  PlayCircle,
  BarChart3,
  Zap,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface MarketingReport {
  date: string;
  metrics: {
    seo_articles: number;
    directory_submissions: number;
    backlinks_created: number;
    keywords_tracked: number;
    social_posts_scheduled: number;
  };
  summary: string;
}

interface SEOArticle {
  id: number;
  title: string;
  keyword: string;
  status: string;
  wordCount: number;
  publishedAt: Date | null;
}

interface DirectorySubmission {
  id: number;
  directoryName: string;
  directoryUrl: string;
  status: string;
  priority: number;
  submittedAt: Date | null;
}

interface Backlink {
  id: number;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  status: string;
}

interface KeywordRanking {
  id: number;
  keyword: string;
  searchEngine: string;
  position: number;
  previousPosition: number | null;
  searchVolume: number;
  difficulty: number;
}

export default function MarketingAutomationDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch marketing report
  const { data: report, isLoading: reportLoading } = useQuery<MarketingReport>({
    queryKey: ["/api/marketing-automation/report"],
  });

  // Fetch SEO articles
  const { data: seoArticles = [], isLoading: articlesLoading } = useQuery<SEOArticle[]>({
    queryKey: ["/api/seo-articles"],
  });

  // Fetch directory submissions
  const { data: directories = [], isLoading: directoriesLoading } = useQuery<DirectorySubmission[]>({
    queryKey: ["/api/directory-submissions"],
  });

  // Fetch backlinks
  const { data: backlinks = [], isLoading: backlinksLoading } = useQuery<Backlink[]>({
    queryKey: ["/api/backlinks"],
  });

  // Fetch keyword rankings
  const { data: keywords = [], isLoading: keywordsLoading } = useQuery<KeywordRanking[]>({
    queryKey: ["/api/keyword-rankings"],
  });

  // Run all bots mutation
  const runAllBotsMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/run-all", "POST", {}),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "All marketing bots executed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-automation/report"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to run marketing bots",
        variant: "destructive",
      });
    },
  });

  // Individual bot mutations
  const runSEOBotMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/seo-content", "POST", {}),
    onSuccess: () => {
      toast({ title: "SEO Bot Running", description: "Generating 10 new SEO articles..." });
      queryClient.invalidateQueries({ queryKey: ["/api/seo-articles"] });
    },
  });

  const runDirectoryBotMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/directories", "POST", {}),
    onSuccess: () => {
      toast({ title: "Directory Bot Running", description: "Submitting to 10 directories..." });
      queryClient.invalidateQueries({ queryKey: ["/api/directory-submissions"] });
    },
  });

  const runBacklinkBotMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/backlinks", "POST", {}),
    onSuccess: () => {
      toast({ title: "Backlink Bot Running", description: "Creating backlink opportunities..." });
      queryClient.invalidateQueries({ queryKey: ["/api/backlinks"] });
    },
  });

  const runRankingBotMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/track-rankings", "POST", {}),
    onSuccess: () => {
      toast({ title: "Ranking Bot Running", description: "Tracking keyword positions..." });
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-rankings"] });
    },
  });

  const runSocialBotMutation = useMutation({
    mutationFn: () => apiRequest("/api/marketing-automation/social-media", "POST", {}),
    onSuccess: () => {
      toast({ title: "Social Bot Running", description: "Scheduling social media posts..." });
    },
  });

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Marketing Dashboard...</p>
        </div>
      </div>
    );
  }

  const publishedArticles = seoArticles.filter((a) => a.status === "published").length;
  const draftArticles = seoArticles.filter((a) => a.status === "draft").length;
  const submittedDirectories = directories.filter((d) => d.status === "submitted").length;
  const pendingDirectories = directories.filter((d) => d.status === "pending").length;
  const activeBacklinks = backlinks.filter((b) => b.status === "active").length;
  const avgDomainAuthority =
    backlinks.length > 0
      ? Math.round(backlinks.reduce((sum, b) => sum + b.domainAuthority, 0) / backlinks.length)
      : 0;

  const topKeywords = keywords
    .sort((a, b) => a.position - b.position)
    .slice(0, 10);

  const getPositionChange = (keyword: KeywordRanking) => {
    if (!keyword.previousPosition) return null;
    return keyword.previousPosition - keyword.position;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent" data-testid="text-dashboard-title">
              Marketing Automation Dashboard
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-dashboard-subtitle">
              Real-time performance tracking for automated marketing campaigns
            </p>
          </div>
          <Button
            onClick={() => runAllBotsMutation.mutate()}
            disabled={runAllBotsMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover-elevate"
            data-testid="button-run-all-bots"
          >
            {runAllBotsMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running All Bots...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Run All Bots
              </>
            )}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500" data-testid="card-seo-articles">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                SEO Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-seo-count">{report?.metrics.seo_articles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedArticles} published, {draftArticles} drafts
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500" data-testid="card-directories">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Globe className="w-4 h-4 mr-2 text-purple-500" />
                Directory Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-directory-count">{report?.metrics.directory_submissions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {submittedDirectories} submitted, {pendingDirectories} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500" data-testid="card-backlinks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Link2 className="w-4 h-4 mr-2 text-green-500" />
                Backlinks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-backlink-count">{report?.metrics.backlinks_created || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg DA: {avgDomainAuthority}, {activeBacklinks} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500" data-testid="card-keywords">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Search className="w-4 h-4 mr-2 text-orange-500" />
                Keywords Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-keyword-count">{report?.metrics.keywords_tracked || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {keywords.filter((k) => k.position <= 10).length} in top 10
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bot Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover-elevate" data-testid="card-seo-bot">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                SEO Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runSEOBotMutation.mutate()}
                disabled={runSEOBotMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full"
                data-testid="button-run-seo-bot"
              >
                {runSEOBotMutation.isPending ? "Running..." : "Generate Content"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-directory-bot">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                Directory Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runDirectoryBotMutation.mutate()}
                disabled={runDirectoryBotMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full"
                data-testid="button-run-directory-bot"
              >
                {runDirectoryBotMutation.isPending ? "Running..." : "Submit Sites"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-backlink-bot">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-green-500" />
                Backlink Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runBacklinkBotMutation.mutate()}
                disabled={runBacklinkBotMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full"
                data-testid="button-run-backlink-bot"
              >
                {runBacklinkBotMutation.isPending ? "Running..." : "Build Links"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-ranking-bot">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-500" />
                Ranking Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runRankingBotMutation.mutate()}
                disabled={runRankingBotMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full"
                data-testid="button-run-ranking-bot"
              >
                {runRankingBotMutation.isPending ? "Running..." : "Track Rankings"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-social-bot">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-500" />
                Social Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runSocialBotMutation.mutate()}
                disabled={runSocialBotMutation.isPending}
                size="sm"
                variant="outline"
                className="w-full"
                data-testid="button-run-social-bot"
              >
                {runSocialBotMutation.isPending ? "Running..." : "Schedule Posts"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed data */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="seo" data-testid="tab-seo">SEO Articles</TabsTrigger>
            <TabsTrigger value="directories" data-testid="tab-directories">Directories</TabsTrigger>
            <TabsTrigger value="rankings" data-testid="tab-rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Directory Progress */}
              <Card data-testid="card-directory-progress">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Directory Submission Progress
                  </CardTitle>
                  <CardDescription>
                    Targeting 500+ directories for maximum reach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Submitted: {submittedDirectories}</span>
                        <span>Target: 500</span>
                      </div>
                      <Progress value={(submittedDirectories / 500) * 100} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pendingDirectories} submissions pending approval
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Keywords */}
              <Card data-testid="card-top-keywords">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Top 10 Keyword Rankings
                  </CardTitle>
                  <CardDescription>
                    Tracking positions across major search engines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {topKeywords.map((keyword) => {
                      const change = getPositionChange(keyword);
                      return (
                        <div
                          key={keyword.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          data-testid={`keyword-${keyword.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{keyword.keyword}</p>
                            <p className="text-xs text-muted-foreground">{keyword.searchEngine}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{keyword.position}</Badge>
                            {change !== null && change !== 0 && (
                              <div className="flex items-center gap-1">
                                {change > 0 ? (
                                  <ArrowUp className="w-3 h-3 text-green-500" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-red-500" />
                                )}
                                <span className={`text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {Math.abs(change)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backlinks Overview */}
            <Card data-testid="card-backlinks-overview">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-green-500" />
                  Recent Backlinks (DA 70+)
                </CardTitle>
                <CardDescription>High-authority backlink opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backlinks.slice(0, 5).map((backlink) => (
                    <div
                      key={backlink.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      data-testid={`backlink-${backlink.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{backlink.sourceDomain}</p>
                        <p className="text-xs text-muted-foreground">{backlink.anchorText}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">DA {backlink.domainAuthority}</Badge>
                        <Badge
                          variant={backlink.status === "active" ? "default" : "secondary"}
                        >
                          {backlink.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card data-testid="card-seo-articles-list">
              <CardHeader>
                <CardTitle>SEO Content Library</CardTitle>
                <CardDescription>
                  {publishedArticles} published articles, {draftArticles} in draft
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {articlesLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading articles...</p>
                  ) : seoArticles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No articles yet. Click "Generate Content" to create your first batch.
                    </p>
                  ) : (
                    seoArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`article-${article.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: {article.keyword} • {article.wordCount} words
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={article.status === "published" ? "default" : "secondary"}
                          >
                            {article.status}
                          </Badge>
                          {article.publishedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directories">
            <Card data-testid="card-directories-list">
              <CardHeader>
                <CardTitle>Directory Submissions</CardTitle>
                <CardDescription>
                  Submitted to {submittedDirectories} directories, {pendingDirectories} pending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {directoriesLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading directories...</p>
                  ) : directories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No submissions yet. Click "Submit Sites" to start.
                    </p>
                  ) : (
                    directories.map((directory) => (
                      <div
                        key={directory.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`directory-${directory.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{directory.directoryName}</h4>
                          <a
                            href={directory.directoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            {directory.directoryUrl}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Priority {directory.priority}</Badge>
                          <Badge
                            variant={
                              directory.status === "submitted"
                                ? "default"
                                : directory.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {directory.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {directory.status === "submitted" && <Eye className="w-3 h-3 mr-1" />}
                            {directory.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {directory.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card data-testid="card-rankings-list">
              <CardHeader>
                <CardTitle>Keyword Rankings</CardTitle>
                <CardDescription>
                  Tracking {keywords.length} keywords across {Array.from(new Set(keywords.map((k) => k.searchEngine))).length} search engines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {keywordsLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading rankings...</p>
                  ) : keywords.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No rankings yet. Click "Track Rankings" to start monitoring.
                    </p>
                  ) : (
                    keywords.map((keyword) => {
                      const change = getPositionChange(keyword);
                      return (
                        <div
                          key={keyword.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                          data-testid={`ranking-${keyword.id}`}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{keyword.keyword}</h4>
                            <p className="text-sm text-muted-foreground">
                              {keyword.searchEngine} • Volume: {keyword.searchVolume.toLocaleString()} • Difficulty: {keyword.difficulty}/100
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono">
                              #{keyword.position}
                            </Badge>
                            {change !== null && change !== 0 && (
                              <div className="flex items-center gap-1">
                                {change > 0 ? (
                                  <ArrowUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className={`text-sm font-medium ${change > 0 ? "text-green-500" : "text-red-500"}`}>
                                  {Math.abs(change)}
                                </span>
                              </div>
                            )}
                            {change === 0 && <Minus className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
