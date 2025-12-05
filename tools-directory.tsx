import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  Image, 
  FileText, 
  Code, 
  TrendingUp,
  Palette,
  Video,
  Mail,
  Hash,
  Lock,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon: React.ReactNode;
  isPremium: boolean;
  toolCount?: number;
  featured?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: "hsuper",
    name: "H-SuperTools",
    description: "250+ FREE SEO, AI writing, image editing, text manipulation, and productivity tools. Everything from keyword research to image compression.",
    url: "https://hsuper.tools",
    category: "All-in-One",
    icon: <Sparkles className="w-6 h-6" />,
    isPremium: false,
    toolCount: 250,
    featured: true,
  },
  {
    id: "canva",
    name: "Canva Pro",
    description: "Professional design tools for social media graphics, presentations, videos, and more. Perfect for content creators.",
    url: "https://www.canva.com/",
    category: "Design",
    icon: <Palette className="w-6 h-6" />,
    isPremium: true,
  },
  {
    id: "removebg",
    name: "Remove.bg",
    description: "AI-powered background removal. Remove backgrounds from images in seconds with perfect edge detection.",
    url: "https://www.remove.bg/",
    category: "Image Editing",
    icon: <Image className="w-6 h-6" />,
    isPremium: false,
  },
  {
    id: "grammarly",
    name: "Grammarly",
    description: "AI writing assistant for grammar, spelling, and style. Write better content faster with real-time suggestions.",
    url: "https://www.grammarly.com/",
    category: "Writing",
    icon: <FileText className="w-6 h-6" />,
    isPremium: true,
  },
  {
    id: "codepen",
    name: "CodePen",
    description: "Online code editor and community. Test HTML, CSS, and JavaScript code instantly in your browser.",
    url: "https://codepen.io/",
    category: "Development",
    icon: <Code className="w-6 h-6" />,
    isPremium: false,
  },
  {
    id: "semrush",
    name: "SEMrush",
    description: "Complete SEO toolkit. Keyword research, rank tracking, competitor analysis, and backlink monitoring.",
    url: "https://www.semrush.com/",
    category: "SEO",
    icon: <TrendingUp className="w-6 h-6" />,
    isPremium: true,
  },
  {
    id: "loom",
    name: "Loom",
    description: "Screen recording tool for quick video messages. Record your screen and share instantly.",
    url: "https://www.loom.com/",
    category: "Video",
    icon: <Video className="w-6 h-6" />,
    isPremium: false,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing platform. Build campaigns, automate emails, and grow your audience.",
    url: "https://mailchimp.com/",
    category: "Marketing",
    icon: <Mail className="w-6 h-6" />,
    isPremium: true,
  },
  {
    id: "hashtagify",
    name: "Hashtagify",
    description: "Hashtag research and analytics. Find trending hashtags and optimize your social media reach.",
    url: "https://hashtagify.me/",
    category: "Social Media",
    icon: <Hash className="w-6 h-6" />,
    isPremium: false,
  },
  {
    id: "lastpass",
    name: "LastPass",
    description: "Password manager for secure credential storage. Generate and store passwords safely.",
    url: "https://www.lastpass.com/",
    category: "Security",
    icon: <Lock className="w-6 h-6" />,
    isPremium: true,
  },
];

const CATEGORIES = ["All", "All-in-One", "Design", "Image Editing", "Writing", "Development", "SEO", "Video", "Marketing", "Social Media", "Security"];

export default function ToolsDirectory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const hasProAccess = user && user.subscriptionTier !== "free";

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTools = TOOLS.filter(t => t.featured);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Pro Tools Directory
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Access $10,000+ worth of professional tools to supercharge your productivity
        </p>
        {!hasProAccess && (
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <Badge variant="default" className="mr-2">Upgrade to Creator+</Badge>
              Unlock full access to all premium tools, tutorials, and integrations
            </p>
          </div>
        )}
      </div>

      {/* Featured Tool - H-SuperTools */}
      {featuredTools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Featured: 250+ Free Tools
          </h2>
          {featuredTools.map(tool => (
            <Card key={tool.id} className="bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-cyan-500/5 border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg">
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{tool.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {tool.toolCount}+ Tools
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90"
                  data-testid="button-hsuper-tools"
                >
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access H-SuperTools FREE
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-tools"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedCategory(category)}
              data-testid={`badge-category-${category.toLowerCase()}`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <Card key={tool.id} className="hover-elevate relative">
            {tool.isPremium && !hasProAccess && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                <div className="text-center p-4">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Creator Tier Required</p>
                  <Button size="sm" className="mt-2" asChild>
                    <a href="/pricing">Upgrade</a>
                  </Button>
                </div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${tool.isPremium ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                  {tool.icon}
                </div>
                <div>
                  <CardTitle>{tool.name}</CardTitle>
                  <Badge variant={tool.isPremium ? "default" : "secondary"} className="mt-1">
                    {tool.isPremium ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                asChild 
                variant={tool.isPremium ? "default" : "outline"} 
                className="w-full"
                disabled={tool.isPremium && !hasProAccess}
                data-testid={`button-tool-${tool.id}`}
              >
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Tool
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No tools found matching your search</p>
        </div>
      )}
    </div>
  );
}
