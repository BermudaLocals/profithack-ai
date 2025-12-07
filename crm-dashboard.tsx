import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import "@/styles/crm-dashboard.css";

interface ContentPost {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  scheduledAt: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  content: {
    text: string;
    hashtags: string[];
  };
}

interface Analytics {
  platform: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  avgEngagement: number;
  totalRevenue: number;
}

export default function CRMDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"calendar" | "generate" | "analytics" | "automation">("calendar");

  // Fetch calendar
  const { data: calendarData } = useQuery<{ posts: ContentPost[] }>({
    queryKey: ["/api/crm/calendar", user?.id],
    enabled: !!user?.id,
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery<{ analytics: Analytics[]; summary: any }>({
    queryKey: ["/api/crm/analytics", user?.id],
    enabled: !!user?.id && activeTab === "analytics",
  });

  if (!user) {
    return (
      <div className="crm-loading">
        <p>Please log in to access CRM Dashboard</p>
      </div>
    );
  }

  const posts = calendarData?.posts || [];
  const analytics = analyticsData?.analytics || [];
  const summary = analyticsData?.summary || { totalPosts: 0, totalViews: 0, totalRevenue: 0 };

  return (
    <div className="crm-dashboard" data-testid="page-crm-dashboard">
      {/* Header */}
      <div className="crm-header">
        <div className="header-left">
          <h1>📱 Content CRM</h1>
          <p>Multi-Platform Content Management</p>
        </div>
        <div className="header-right">
          <Card className="stat-card">
            <span className="stat-label">Total Posts</span>
            <span className="stat-value" data-testid="stat-posts">{summary.totalPosts}</span>
          </Card>
          <Card className="stat-card">
            <span className="stat-label">Total Views</span>
            <span className="stat-value" data-testid="stat-views">{summary.totalViews.toLocaleString()}</span>
          </Card>
          <Card className="stat-card">
            <span className="stat-label">Revenue</span>
            <span className="stat-value" data-testid="stat-revenue">${summary.totalRevenue.toLocaleString()}</span>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="crm-nav">
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          onClick={() => setActiveTab("calendar")}
          data-testid="tab-calendar"
        >
          📅 Calendar
        </Button>
        <Button
          variant={activeTab === "generate" ? "default" : "ghost"}
          onClick={() => setActiveTab("generate")}
          data-testid="tab-generate"
        >
          ✨ Generate
        </Button>
        <Button
          variant={activeTab === "analytics" ? "default" : "ghost"}
          onClick={() => setActiveTab("analytics")}
          data-testid="tab-analytics"
        >
          📊 Analytics
        </Button>
        <Button
          variant={activeTab === "automation" ? "default" : "ghost"}
          onClick={() => setActiveTab("automation")}
          data-testid="tab-automation"
        >
          ⚙️ Automation
        </Button>
      </div>

      {/* Content Sections */}
      <div className="crm-content">
        {activeTab === "calendar" && <CalendarSection posts={posts} />}
        {activeTab === "generate" && <GenerateSection userId={user.id} />}
        {activeTab === "analytics" && <AnalyticsSection analytics={analytics} />}
        {activeTab === "automation" && <AutomationSection />}
      </div>
    </div>
  );
}

// ============================================
// CALENDAR SECTION
// ============================================

function CalendarSection({ posts }: { posts: ContentPost[] }) {
  return (
    <div className="calendar-section" data-testid="section-calendar">
      <h2>📅 Scheduled Posts</h2>
      
      {posts.length === 0 ? (
        <Card className="empty-state">
          <p>No posts scheduled yet. Generate content to get started!</p>
        </Card>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <Card key={post.id} className="post-card" data-testid={`post-${post.id}`}>
              <div className="post-header">
                <h3>{post.title}</h3>
                <span className={`post-status ${post.status}`}>{post.status}</span>
              </div>
              <p className="post-description">{post.description}</p>
              <div className="post-platforms">
                {post.platforms.map((p) => (
                  <span key={p} className="platform-badge">{p}</span>
                ))}
              </div>
              <div className="post-content">
                <p>{post.content.text}</p>
                <div className="hashtags">
                  {post.content.hashtags.map((tag) => (
                    <span key={tag} className="hashtag">{tag}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// GENERATE SECTION
// ============================================

function GenerateSection({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: async (data: { topic: string; platform: string }) => {
      const res = await apiRequest("POST", "/api/crm/generate-content", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "✅ Content Generated!",
        description: "Your viral content is ready",
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "Failed to generate content",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic) {
      toast({
        title: "⚠️ Missing Topic",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ topic, platform });
  };

  return (
    <div className="generate-section" data-testid="section-generate">
      <h2>✨ AI Content Generator</h2>
      
      <Card className="generator-form">
        <div className="form-group">
          <label>Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., How to make $5K with AI"
            data-testid="input-topic"
          />
        </div>

        <div className="form-group">
          <label>Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="platform-select"
            data-testid="select-platform"
          >
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube Shorts</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          data-testid="button-generate"
        >
          {generateMutation.isPending ? "Generating..." : "Generate Content"}
        </Button>
      </Card>

      {generatedContent && (
        <Card className="generated-content" data-testid="generated-content">
          <h3>Generated Content</h3>
          
          <div className="content-block">
            <label>Hook:</label>
            <p className="hook">{generatedContent.hook}</p>
          </div>

          <div className="content-block">
            <label>Text:</label>
            <p>{generatedContent.text}</p>
          </div>

          <div className="content-block">
            <label>CTA:</label>
            <p className="cta">{generatedContent.cta}</p>
          </div>

          <div className="content-block">
            <label>Hashtags:</label>
            <div className="hashtags">
              {generatedContent.hashtags.map((tag: string) => (
                <span key={tag} className="hashtag">{tag}</span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// ANALYTICS SECTION
// ============================================

function AnalyticsSection({ analytics }: { analytics: Analytics[] }) {
  return (
    <div className="analytics-section" data-testid="section-analytics">
      <h2>📊 Performance Analytics</h2>
      
      {analytics.length === 0 ? (
        <Card className="empty-state">
          <p>No analytics data yet. Start posting to see metrics!</p>
        </Card>
      ) : (
        <div className="analytics-grid">
          {analytics.map((platform) => (
            <Card key={platform.platform} className="analytics-card" data-testid={`analytics-${platform.platform}`}>
              <h3>{platform.platform}</h3>
              <div className="metric">
                <span className="metric-label">Posts</span>
                <span className="metric-value">{platform.totalPosts}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Views</span>
                <span className="metric-value">{platform.totalViews.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Likes</span>
                <span className="metric-value">{platform.totalLikes.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Engagement</span>
                <span className="metric-value">{platform.avgEngagement}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">${platform.totalRevenue.toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// AUTOMATION SECTION
// ============================================

function AutomationSection() {
  return (
    <div className="automation-section" data-testid="section-automation">
      <h2>⚙️ Automation Rules</h2>
      
      <Card className="empty-state">
        <p>Automation features coming soon!</p>
        <p className="subtitle">Set up rules to auto-post, repost, and optimize content</p>
      </Card>
    </div>
  );
}
