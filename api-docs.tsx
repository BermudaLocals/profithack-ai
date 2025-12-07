import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Key, Zap, Shield, BookOpen } from "lucide-react";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "POST",
      path: "/api/videos",
      description: "Upload a new video to your profile",
      auth: "Required"
    },
    {
      method: "GET",
      path: "/api/videos/:id",
      description: "Get video details by ID",
      auth: "Optional"
    },
    {
      method: "POST",
      path: "/api/gifts/send",
      description: "Send a virtual gift to a creator",
      auth: "Required"
    },
    {
      method: "GET",
      path: "/api/user/wallet",
      description: "Get wallet balance and transaction history",
      auth: "Required"
    },
    {
      method: "POST",
      path: "/api/bots/trigger",
      description: "Manually trigger a marketing bot",
      auth: "Required"
    },
    {
      method: "GET",
      path: "/api/analytics/stats",
      description: "Get detailed analytics for your content",
      auth: "Required"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-display font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            PROFITHACK AI API
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Build powerful integrations with our RESTful API. Access videos, users, analytics, 
            payments, and AI automation programmatically.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700" data-testid="button-get-api-key">
              <Key className="h-4 w-4 mr-2" />
              Get API Key
            </Button>
            <Button size="lg" variant="outline" data-testid="button-view-docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Zap className="h-6 w-6 text-pink-400" />
              Quick Start
            </CardTitle>
            <CardDescription>Get up and running in under 5 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Get your API key</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Navigate to Settings → API Keys to generate your secret key.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Make your first request</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`curl -X GET https://profithackai.com/api/videos \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Example Response</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`{
  "videos": [
    {
      "id": "abc123",
      "title": "My First Video",
      "views": 1024,
      "likes": 89,
      "createdAt": "2024-11-04T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 w-fit mb-4">
                <Shield className="h-6 w-6 text-pink-400" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                OAuth 2.0 authentication, rate limiting, and 99.9% uptime SLA.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 w-fit mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle>Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time events for new videos, gifts received, followers, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20 w-fit mb-4">
                <Code className="h-6 w-6 text-cyan-400" />
              </div>
              <CardTitle>SDKs & Libraries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Official SDKs for JavaScript, Python, Go, and Ruby. Community libraries available.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 w-fit mb-4">
                <BookOpen className="h-6 w-6 text-pink-400" />
              </div>
              <CardTitle>Comprehensive Docs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed guides, code examples, and interactive API playground.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Core API Endpoints</CardTitle>
            <CardDescription>Key endpoints to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover-elevate transition-all duration-200" data-testid={`endpoint-${index}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant={endpoint.method === "GET" ? "outline" : "default"} className={endpoint.method === "GET" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-green-500/10 text-green-400 border-green-500/30"}>
                      {endpoint.method}
                    </Badge>
                    <div className="flex-1">
                      <code className="text-sm font-mono">{endpoint.path}</code>
                      <p className="text-xs text-muted-foreground mt-1">{endpoint.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {endpoint.auth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-pink-400 mb-2">1,000</div>
                <div className="text-sm text-muted-foreground">Requests/hour (Free)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-2">10,000</div>
                <div className="text-sm text-muted-foreground">Requests/hour (Pro)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400 mb-2">100,000</div>
                <div className="text-sm text-muted-foreground">Requests/hour (Enterprise)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
