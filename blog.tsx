import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "How to Make $1,000/Month with AI Marketing Bots",
      excerpt: "A complete guide to setting up automated marketing campaigns that generate passive income using PROFITHACK AI's bot system.",
      category: "Tutorial",
      author: "Alex Rivera",
      date: "Nov 1, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
    },
    {
      title: "Creator Economy Trends for 2026",
      excerpt: "What's next for content creators? From AI influencers to global crypto payments, here's what you need to know.",
      category: "Industry",
      author: "Sarah Chen",
      date: "Oct 28, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80"
    },
    {
      title: "5 Viral Content Formulas That Actually Work",
      excerpt: "Proven templates for creating viral TikTok and Instagram content. Includes real examples and hook strategies.",
      category: "Strategy",
      author: "Marcus Johnson",
      date: "Oct 25, 2024",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
    },
    {
      title: "Building in Public: Our First 1,000 Users",
      excerpt: "Lessons learned from launching PROFITHACK AI, the mistakes we made, and what we'd do differently.",
      category: "Company",
      author: "Team PROFITHACK",
      date: "Oct 20, 2024",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    },
    {
      title: "Monetization Strategies for New Creators",
      excerpt: "Don't have a huge following? No problem. Here's how to start earning from day one with smart monetization.",
      category: "Tutorial",
      author: "Emma Taylor",
      date: "Oct 15, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"
    },
    {
      title: "AI vs Human Content: What Performs Better?",
      excerpt: "We tested AI-generated content against human creators. The results will surprise you.",
      category: "Research",
      author: "David Park",
      date: "Oct 10, 2024",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-display font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Creator Economy Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Guides, tutorials, and industry insights to help you succeed as a creator.
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden hover-elevate transition-all duration-200">
          <div className="grid md:grid-cols-2 gap-0">
            <div 
              className="h-64 md:h-auto bg-cover bg-center" 
              style={{ backgroundImage: `url(${posts[0].image})` }}
            />
            <div className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">
                Featured
              </Badge>
              <CardTitle className="text-3xl mb-4">{posts[0].title}</CardTitle>
              <CardDescription className="text-base mb-6">
                {posts[0].excerpt}
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {posts[0].date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {posts[0].readTime}
                </span>
              </div>
              <Button className="w-fit" data-testid="button-read-featured">
                Read More
              </Button>
            </div>
          </div>
        </Card>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post, index) => (
            <Card key={index} className="overflow-hidden hover-elevate transition-all duration-200" data-testid={`card-post-${index}`}>
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">
                  {post.category}
                </Badge>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <Button variant="outline" className="w-full" data-testid={`button-read-${index}`}>
                  Read Article
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter CTA */}
        <Card className="mt-16 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <TrendingUp className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Stay Updated</CardTitle>
            <CardDescription>
              Get weekly creator economy insights delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex gap-2 w-full max-w-md">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 rounded-lg bg-background border"
                data-testid="input-newsletter-email"
              />
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700" data-testid="button-subscribe">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
