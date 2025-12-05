import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Facebook, 
  Instagram, 
  Twitter,
  MessageCircle,
  Video,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Info,
  AlertCircle,
} from "lucide-react";
import { SiTiktok, SiReddit } from "react-icons/si";

type Platform = {
  id: string;
  name: string;
  icon: any;
  color: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: string;
    helpUrl?: string;
  }>;
  helpText: string;
  setupUrl: string;
};

const PLATFORMS: Platform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAABwz...", type: "password" },
      { key: "businessId", label: "Page/Business ID", placeholder: "123456789", helpUrl: "https://business.facebook.com" },
    ],
    helpText: "Get your access token from Meta Business Suite → Settings → Business Settings → System Users",
    setupUrl: "https://business.facebook.com/settings/system-users",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "IGQWRPa...", type: "password" },
      { key: "businessId", label: "Instagram Business ID", placeholder: "123456789" },
    ],
    helpText: "Connect your Instagram Business account through Meta Business Suite",
    setupUrl: "https://business.facebook.com/instagram",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "bg-black",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "ak_...", type: "password" },
      { key: "apiSecret", label: "API Secret", placeholder: "as_...", type: "password" },
      { key: "clientId", label: "Client ID", placeholder: "cl_..." },
    ],
    helpText: "Apply for TikTok Developer API access at developers.tiktok.com",
    setupUrl: "https://developers.tiktok.com",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "bg-sky-500",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xxxxxxxx", type: "password" },
      { key: "apiSecret", label: "API Secret", placeholder: "xxxxxxxx", type: "password" },
      { key: "accessToken", label: "Access Token", placeholder: "xxxxxxxx", type: "password" },
    ],
    helpText: "Get your API credentials from Twitter Developer Portal",
    setupUrl: "https://developer.twitter.com/en/portal/dashboard",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: SiReddit,
    color: "bg-orange-600",
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "xxxxxxxx" },
      { key: "clientSecret", label: "Client Secret", placeholder: "xxxxxxxx", type: "password" },
    ],
    helpText: "Create an app at reddit.com/prefs/apps to get credentials",
    setupUrl: "https://www.reddit.com/prefs/apps",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    color: "bg-green-600",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAABwz...", type: "password" },
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789" },
      { key: "businessId", label: "Business Account ID", placeholder: "123456789" },
    ],
    helpText: "Set up WhatsApp Business API through Meta Business Suite",
    setupUrl: "https://business.facebook.com/wa/manage/home",
  },
];

type SocialCredential = {
  id: string;
  platform: string;
  platformUsername: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastVerified: string | null;
  lastUsed: string | null;
  canPost: boolean;
};

export default function SocialMediaSettings() {
  const { toast } = useToast();
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});

  // Fetch existing credentials
  const { data: credentials = [], isLoading } = useQuery<SocialCredential[]>({
    queryKey: ["/api/social-media-credentials"],
  });

  // Save credentials mutation
  const saveMutation = useMutation({
    mutationFn: async ({ platform, data }: { platform: string; data: any }) => {
      return apiRequest(`/api/social-media-credentials/${platform}`, "POST", data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "✅ Credentials Saved",
        description: `${variables.platform} credentials have been securely saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-credentials"] });
      setExpandedPlatform(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save credentials",
        variant: "destructive",
      });
    },
  });

  // Delete credentials mutation
  const deleteMutation = useMutation({
    mutationFn: async (platform: string) => {
      return apiRequest(`/api/social-media-credentials/${platform}`, "DELETE", {});
    },
    onSuccess: (_, platform) => {
      toast({
        title: "Credentials Removed",
        description: `${platform} credentials have been deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-credentials"] });
    },
  });

  const getCredential = (platformId: string) => {
    return credentials.find((c) => c.platform === platformId);
  };

  const handleSubmit = (platform: Platform) => {
    const data = formData[platform.id] || {};
    saveMutation.mutate({
      platform: platform.id,
      data: {
        credentials: data,
        platformUsername: data.username || null,
      },
    });
  };

  const updateFormField = (platformId: string, key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [platformId]: {
        ...(prev[platformId] || {}),
        [key]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Social Media Automation
        </h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to automatically promote your content and marketplace products.
        </p>
        
        {/* Security Notice */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">🔒 Secure API Token Storage</p>
                <p className="text-xs text-muted-foreground">
                  We NEVER ask for your passwords. All platforms require official API tokens or OAuth connections.
                  Your credentials are encrypted and never exposed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const credential = getCredential(platform.id);
          const isExpanded = expandedPlatform === platform.id;
          const Icon = platform.icon;

          return (
            <Card
              key={platform.id}
              className={`hover-elevate ${credential?.isVerified ? 'border-green-500/30' : ''}`}
              data-testid={`card-platform-${platform.id}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${platform.color} rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      {credential?.platformUsername && (
                        <p className="text-xs text-muted-foreground mt-1">
                          @{credential.platformUsername}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {credential?.isVerified ? (
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : credential ? (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {!isExpanded ? (
                <CardFooter className="flex gap-2">
                  {credential ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedPlatform(platform.id)}
                        data-testid={`button-edit-${platform.id}`}
                      >
                        Update Credentials
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(platform.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-remove-${platform.id}`}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                      onClick={() => setExpandedPlatform(platform.id)}
                      data-testid={`button-connect-${platform.id}`}
                    >
                      Connect {platform.name}
                    </Button>
                  )}
                </CardFooter>
              ) : (
                <CardContent className="space-y-4 pb-4">
                  {/* Help Text */}
                  <div className="flex gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-2">
                      <p>{platform.helpText}</p>
                      <a
                        href={platform.setupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                      >
                        Get API credentials <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Form Fields */}
                  {platform.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`${platform.id}-${field.key}`}>
                        {field.label}
                        {field.helpUrl && (
                          <a
                            href={field.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs text-blue-500 hover:underline"
                          >
                            (Help)
                          </a>
                        )}
                      </Label>
                      <Input
                        id={`${platform.id}-${field.key}`}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={formData[platform.id]?.[field.key] || ""}
                        onChange={(e) => updateFormField(platform.id, field.key, e.target.value)}
                        data-testid={`input-${platform.id}-${field.key}`}
                      />
                    </div>
                  ))}

                  {/* Username (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor={`${platform.id}-username`}>
                      Username (Optional)
                    </Label>
                    <Input
                      id={`${platform.id}-username`}
                      placeholder="@yourhandle"
                      value={formData[platform.id]?.username || ""}
                      onChange={(e) => updateFormField(platform.id, "username", e.target.value)}
                      data-testid={`input-${platform.id}-username`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                      onClick={() => handleSubmit(platform)}
                      disabled={saveMutation.isPending}
                      data-testid={`button-save-${platform.id}`}
                    >
                      {saveMutation.isPending ? "Saving..." : "Save Credentials"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExpandedPlatform(null);
                        setFormData((prev) => {
                          const newData = { ...prev };
                          delete newData[platform.id];
                          return newData;
                        });
                      }}
                      data-testid={`button-cancel-${platform.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Posting Schedule Info */}
      {credentials.filter((c) => c.isVerified).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Automated Posting Schedule</CardTitle>
            <CardDescription>
              Your marketing bots will automatically promote your marketplace products and platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
                <p className="text-sm font-semibold mb-1">Marketplace Products</p>
                <p className="text-xs text-muted-foreground">
                  Automatically promotes your products to attract affiliates and buyers
                </p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                <p className="text-sm font-semibold mb-1">Platform Features</p>
                <p className="text-xs text-muted-foreground">
                  Shares PROFITHACK AI features to drive waitlist signups
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
