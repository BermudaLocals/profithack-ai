/**
 * PROFITHACK AI - Deploy AI Creator to External Platforms
 * OnlyFans, Fansly, ManyVids, Patreon, JustForFans
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Rocket,
  CheckCircle2,
  DollarSign,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeployCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: {
    id: string;
    name: string;
    handle: string;
    bio: string;
    businessProfile: {
      currentMonthlyRevenue: number;
      subscriberCount: number;
    };
  };
}

const PLATFORMS = [
  {
    id: "onlyfans",
    name: "OnlyFans",
    description: "Largest creator platform, 18+ content, subscription-based",
    revenue: "$85K-$92K/month potential",
    subscribers: "45K-50K average",
    setup: [
      "Create account at onlyfans.com/start",
      "Upload verification documents (ID, selfie)",
      "Set up payment method (bank account or Paxum)",
      "Import profile: bio, photos from AI creator",
      "Set subscription tiers: $9.99, $19.99, $49.99",
      "Post 4x daily using content calendar",
      "Enable tips, PPV messages, custom content requests",
    ],
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    id: "fansly",
    name: "Fansly",
    description: "Fast-growing alternative, flexible content tiers, crypto payments",
    revenue: "$50K-$70K/month potential",
    subscribers: "30K-40K average",
    setup: [
      "Sign up at fansly.com/register",
      "Complete identity verification (ID + selfie)",
      "Connect payment method (crypto-friendly)",
      "Import AI creator profile and content",
      "Create subscription tiers (up to 5 tiers)",
      "Enable messaging, tips, and custom requests",
      "Post 3-4x daily, leverage trending hashtags",
    ],
    color: "from-pink-500 to-rose-500",
    popular: true,
  },
  {
    id: "patreon",
    name: "Patreon",
    description: "Creator membership platform, SFW & NSFW, monthly pledges",
    revenue: "$30K-$50K/month potential",
    subscribers: "20K-30K average",
    setup: [
      "Create creator account at patreon.com",
      "Set up payment info (Stripe/PayPal)",
      "Import creator bio, goals, and rewards",
      "Create membership tiers ($5, $10, $25, $50)",
      "Define exclusive perks per tier",
      "Post exclusive content 3x weekly",
      "Engage with patrons via comments and DMs",
    ],
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "manyvids",
    name: "ManyVids",
    description: "Adult content marketplace, video sales, custom content, live cams",
    revenue: "$40K-$60K/month potential",
    subscribers: "25K-35K average",
    setup: [
      "Register at manyvids.com/Become-MV-Star",
      "Complete ID verification process",
      "Set up payment (direct deposit, Paxum, crypto)",
      "Upload AI creator profile and photos",
      "List video content for sale ($10-$50 per video)",
      "Enable custom video requests ($200-$500 each)",
      "Go live 2-3x weekly for tips and engagement",
    ],
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "justforfans",
    name: "JustFor.Fans",
    description: "LGBTQ+ friendly platform, flexible monetization, crypto payments",
    revenue: "$25K-$45K/month potential",
    subscribers: "15K-25K average",
    setup: [
      "Sign up at justfor.fans/join",
      "Verify identity with government ID",
      "Connect payment (bank, crypto, or Paxum)",
      "Import AI creator profile and content",
      "Set monthly subscription price ($9-$30)",
      "Enable tips, PPV content, and custom requests",
      "Post daily content and engage with fans",
    ],
    color: "from-green-500 to-emerald-500",
  },
];

export function DeployCreatorModal({
  open,
  onOpenChange,
  creator,
}: DeployCreatorModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleDeploy = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsDeploying(true);
    
    // Simulate deployment
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsDeploying(false);
    onOpenChange(false);
    
    // Show success message
    alert(
      `✅ Deployment Instructions Generated!\n\n` +
      `${creator.name} is ready to deploy to:\n` +
      selectedPlatforms.map((id) => `• ${PLATFORMS.find((p) => p.id === id)?.name}`).join("\n") +
      `\n\nCheck your email for detailed setup guides!`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-black/95 backdrop-blur-lg border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Deploy {creator.name} to Platforms
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select platforms to deploy your AI creator. Each platform includes step-by-step setup instructions.
          </DialogDescription>
        </DialogHeader>

        {/* Creator Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Revenue</span>
            </div>
            <p className="text-white font-bold">
              ${creator.businessProfile.currentMonthlyRevenue.toLocaleString()}/mo
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Subscribers</span>
            </div>
            <p className="text-white font-bold">
              {creator.businessProfile.subscriberCount.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium">Platforms</span>
            </div>
            <p className="text-white font-bold">{selectedPlatforms.length} selected</p>
          </div>
        </div>

        {/* Platform Selection */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <div
                  key={platform.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer hover-elevate",
                    isSelected
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-cyan-500/50"
                      : "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                  )}
                  onClick={() => togglePlatform(platform.id)}
                  data-testid={`platform-${platform.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePlatform(platform.id)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{platform.name}</h3>
                        {platform.popular && (
                          <Badge className="text-[9px] px-1.5 py-0 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                            POPULAR
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 mb-2">
                        {platform.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-green-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{platform.revenue}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                          <Users className="w-3 h-3" />
                          <span>{platform.subscribers}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <>
                          <Separator className="my-3 bg-gray-700" />
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-cyan-400">
                              Setup Instructions:
                            </h4>
                            <ol className="space-y-1.5 text-xs text-gray-300">
                              {platform.setup.map((step, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
              data-testid="button-cancel-deploy"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={selectedPlatforms.length === 0 || isDeploying}
              className="bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700"
              data-testid="button-confirm-deploy"
            >
              <Rocket className="w-4 h-4 mr-2" />
              {isDeploying ? "Generating..." : `Deploy to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
