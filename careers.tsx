import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Palette, LineChart, Users, Rocket, Heart } from "lucide-react";

export default function CareersPage() {
  const positions = [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-Time",
      icon: Code,
      description: "Build scalable features for our creator platform using React, Node.js, and PostgreSQL.",
      requirements: ["5+ years React/TypeScript", "Node.js backend experience", "Database optimization"]
    },
    {
      title: "AI/ML Engineer",
      department: "AI",
      location: "Remote",
      type: "Full-Time",
      icon: Rocket,
      description: "Develop AI bots for content generation, trend analysis, and automated marketing.",
      requirements: ["Experience with OpenAI/Anthropic APIs", "Python/TypeScript", "LLM fine-tuning"]
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-Time",
      icon: Palette,
      description: "Design beautiful, intuitive experiences for creators and viewers on web and mobile.",
      requirements: ["Figma expertise", "Mobile-first design", "Design systems experience"]
    },
    {
      title: "Growth Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-Time",
      icon: LineChart,
      description: "Drive user acquisition through viral marketing, influencer partnerships, and paid ads.",
      requirements: ["TikTok/Instagram marketing", "Viral content strategies", "Analytics-driven"]
    },
    {
      title: "Community Manager",
      department: "Community",
      location: "Remote",
      type: "Full-Time",
      icon: Users,
      description: "Build and engage our creator community across Discord, Telegram, and social media.",
      requirements: ["Creator economy experience", "Social media native", "Excellent communication"]
    }
  ];

  const benefits = [
    "💰 Competitive salary + equity",
    "🌍 Work from anywhere",
    "🏥 Health, dental, vision insurance",
    "📚 Learning & development budget",
    "🎯 Unlimited PTO",
    "💻 Top-tier equipment",
    "🚀 Fast-growing startup",
    "🎨 Creator-first culture"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-display font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Build the Future of Creator Economy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our mission to empower creators worldwide with AI automation and global monetization.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700" data-testid="button-view-openings">
            View Open Positions
          </Button>
        </div>
      </div>

      {/* Why Work Here */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">Why PROFITHACK AI?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building something that matters. Join a team that's passionate about democratizing 
            content creation and helping creators earn globally.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <p className="text-sm">{benefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-display font-bold mb-8">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position, index) => (
              <Card key={index} className="hover-elevate transition-all duration-200" data-testid={`card-position-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                        <position.icon className="h-6 w-6 text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <CardTitle className="text-xl">{position.title}</CardTitle>
                          <Badge variant="outline">{position.type}</Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span>{position.department}</span>
                          <span>•</span>
                          <span>{position.location}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" data-testid={`button-apply-${index}`}>Apply</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{position.description}</p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {position.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Culture Section */}
        <Card className="mt-16 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Heart className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Our Culture</CardTitle>
          </CardHeader>
          <CardContent className="text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-6">
              We're a remote-first team of builders, creators, and dreamers. We value autonomy, 
              creativity, and getting things done. We ship fast, learn faster, and always put 
              creators first.
            </p>
            <p className="text-sm text-muted-foreground">
              Don't see the right role? Email us at <a href="mailto:careers@profithackai.com" className="text-pink-400 hover:text-pink-300">careers@profithackai.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
