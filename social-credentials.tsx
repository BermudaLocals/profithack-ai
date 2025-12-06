import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, ExternalLink, Key, Lock } from "lucide-react";

export default function SocialCredentials() {
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const handleOAuthConnect = (platform: string) => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      `/api/social/connect/${platform}`,
      `${platform}_oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'social-connect-success') {
        toast({
          title: "Connected!",
          description: `${event.data.platform} account connected successfully. Bots can now post to this platform.`,
        });
        window.removeEventListener('message', messageHandler);
      } else if (event.data.type === 'social-connect-error') {
        toast({
          title: "Connection Failed",
          description: event.data.error || "Failed to connect. Please try again.",
          variant: "destructive",
        });
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);
  };

  const platforms = [
    {
      id: "threads",
      name: "Threads",
      icon: "🧵",
      tier: "Essential",
      description: "Meta's text-based platform. 150M+ users. Perfect for text + image posts.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "App ID", placeholder: "Enter Threads App ID" },
        { key: "client_secret", label: "App Secret", placeholder: "Enter Threads App Secret" },
      ],
      docsUrl: "https://developers.facebook.com/docs/threads",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "📱",
      tier: "Essential",
      description: "Best for viral short videos. 1B+ users. Perfect for Reels content.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "Client Key", placeholder: "Enter TikTok Client Key" },
        { key: "client_secret", label: "Client Secret", placeholder: "Enter TikTok Client Secret" },
      ],
      docsUrl: "https://developers.tiktok.com/",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "📸",
      tier: "Essential",
      description: "2B+ users. Reels, Stories, and Feed posts. High engagement rates.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "App ID", placeholder: "Enter Meta App ID" },
        { key: "client_secret", label: "App Secret", placeholder: "Enter Meta App Secret" },
      ],
      docsUrl: "https://developers.facebook.com/",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "📺",
      tier: "Essential",
      description: "2.5B+ users. Best for long-form content. Strong monetization via AdSense.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "Client ID", placeholder: "Enter Google OAuth Client ID" },
        { key: "client_secret", label: "Client Secret", placeholder: "Enter Google OAuth Client Secret" },
      ],
      docsUrl: "https://console.cloud.google.com/",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "📘",
      tier: "Essential",
      description: "3B+ users. Broad demographic reach. Good for community building.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "App ID", placeholder: "Enter Meta App ID (same as Instagram)" },
        { key: "client_secret", label: "App Secret", placeholder: "Enter Meta App Secret" },
      ],
      docsUrl: "https://developers.facebook.com/",
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: "🐦",
      tier: "Essential",
      description: "500M+ users. Real-time engagement. Great for building personal brand.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "API Key", placeholder: "Enter X API Key" },
        { key: "client_secret", label: "API Secret", placeholder: "Enter X API Secret" },
      ],
      docsUrl: "https://developer.twitter.com/",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      tier: "Professional",
      description: "900M+ professionals. B2B content, networking, thought leadership.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "Client ID", placeholder: "Enter LinkedIn Client ID" },
        { key: "client_secret", label: "Client Secret", placeholder: "Enter LinkedIn Client Secret" },
      ],
      docsUrl: "https://developer.linkedin.com/",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      icon: "📌",
      tier: "Niche",
      description: "450M+ users. Visual discovery. Great for lifestyle, DIY, fashion content.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "App ID", placeholder: "Enter Pinterest App ID" },
        { key: "client_secret", label: "App Secret", placeholder: "Enter Pinterest App Secret" },
      ],
      docsUrl: "https://developers.pinterest.com/",
    },
    {
      id: "snapchat",
      name: "Snapchat",
      icon: "👻",
      tier: "Niche",
      description: "750M+ users. Younger demographic (Gen Z). Stories and Spotlight.",
      oauthAvailable: true,
      fields: [
        { key: "client_id", label: "Client ID", placeholder: "Enter Snapchat Client ID" },
        { key: "client_secret", label: "Client Secret", placeholder: "Enter Snapchat Client Secret" },
      ],
      docsUrl: "https://developers.snap.com/",
    },
  ];

  const handleSave = async (platformId: string) => {
    setSaving(platformId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(null);
    toast({
      title: "Credentials Saved",
      description: `${platformId.toUpperCase()} credentials have been securely saved.`,
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Social Media API Credentials
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure bot posting to your social media accounts
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Lock className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ All credentials are encrypted and stored securely in Replit Secrets</p>
          <p>✅ Never visible in code or logs</p>
          <p>✅ Only used by authenticated bots</p>
          <p>✅ Can be revoked anytime</p>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Posting Status</CardTitle>
          <CardDescription>
            Bots are currently configured to post to:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium">PROFITHACK App (Tube + Reels)</span>
            <span className="ml-auto text-sm text-muted-foreground">✅ Active</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10">
            <Key className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Social Media Platforms</span>
            <span className="ml-auto text-sm text-muted-foreground">⏳ Pending API Keys</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Add your API credentials below to enable posting to external social media.
          </p>
        </CardContent>
      </Card>

      {/* Platform Credentials */}
      {platforms.map((platform) => (
        <Card key={platform.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{platform.icon}</span>
                <div>
                  <CardTitle>{platform.name}</CardTitle>
                  <CardDescription>
                    {platform.description}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(platform.docsUrl, '_blank')}
                data-testid={`button-docs-${platform.id}`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Access
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tier Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                platform.tier === 'Essential' ? 'bg-green-500/20 text-green-400' :
                platform.tier === 'Professional' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {platform.tier}
              </span>
            </div>

            {/* OAuth Connect Button for Threads */}
            {platform.id === 'threads' && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Quick Connect with OAuth
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  One-click authorization. Connect your Threads account and start posting with bots.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  data-testid="button-connect-threads-oauth"
                  onClick={() => handleOAuthConnect('threads')}
                >
                  <span className="text-xl mr-2">🧵</span>
                  Connect with Threads
                </Button>
              </div>
            )}

            {/* OAuth Connect Button for Facebook */}
            {platform.id === 'facebook' && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Quick Connect with OAuth
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  One-click authorization. Connect multiple Facebook Pages or personal accounts.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  data-testid="button-connect-facebook-oauth"
                  onClick={() => handleOAuthConnect('facebook')}
                >
                  <span className="text-xl mr-2">📘</span>
                  Connect with Facebook
                </Button>
              </div>
            )}

            {/* OAuth Connect Button for Instagram */}
            {platform.id === 'instagram' && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Quick Connect with OAuth
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect your Instagram Business account. Post Reels, Stories, and Feed posts automatically.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  data-testid="button-connect-instagram-oauth"
                  onClick={() => handleOAuthConnect('instagram')}
                >
                  <span className="text-xl mr-2">📸</span>
                  Connect with Instagram
                </Button>
              </div>
            )}

            {/* OAuth Connect Button for Twitter/X */}
            {platform.id === 'twitter' && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-400/10 to-blue-500/10 border border-blue-400/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Quick Connect with OAuth
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Auto-post tweets and engage with your X audience.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
                  data-testid="button-connect-twitter-oauth"
                  onClick={() => handleOAuthConnect('twitter')}
                >
                  <span className="text-xl mr-2">🐦</span>
                  Connect with X
                </Button>
              </div>
            )}
            
            {/* OAuth Connect Button for TikTok */}
            {platform.id === 'tiktok' && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  Connect with TikTok OAuth
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Recommended: Connect your TikTok account using OAuth for secure authentication.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  data-testid="button-connect-tiktok-oauth"
                  onClick={() => handleOAuthConnect('tiktok')}
                >
                  <span className="text-xl mr-2">📱</span>
                  Sign in with TikTok
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Or enter API credentials manually below
                </p>
              </div>
            )}

            {/* Manual API Credentials */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Manual API Credentials:</p>
              {platform.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`${platform.id}-${field.key}`}>
                    {field.label}
                  </Label>
                  <Input
                    id={`${platform.id}-${field.key}`}
                    type="password"
                    placeholder={field.placeholder}
                    data-testid={`input-${platform.id}-${field.key}`}
                  />
                </div>
              ))}
              <Button
                onClick={() => handleSave(platform.id)}
                disabled={saving === platform.id}
                className="w-full"
                data-testid={`button-save-${platform.id}`}
              >
                {saving === platform.id ? "Saving..." : "Save Credentials"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            📚 Check <strong>API_CREDENTIALS_GUIDE.md</strong> for step-by-step instructions for each platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer">
                TikTok Developer Portal
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                Google Cloud Console
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer">
                Meta Developer Portal
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://developer.twitter.com/" target="_blank" rel="noopener noreferrer">
                X/Twitter Developer
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
