import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Twitter, Facebook, Linkedin, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ShareProgressProps {
  milestone?: {
    type: string;
    description: string;
  };
  videoId?: string;
  trigger?: React.ReactNode;
}

const SHARE_TEMPLATES = {
  first_video: "Just posted my first video on PROFITHACK AI! 🚀 Building in public and loving the journey. Check it out: ",
  "100_followers": "Hit 100 followers on PROFITHACK AI! 🎉 Thank you all for the support. Building something amazing here: ",
  first_spark: "Received my first Spark (virtual gift) on PROFITHACK AI! 💎 This platform is incredible for creators: ",
  "1k_views": "Just hit 1,000 views on PROFITHACK AI! 📈 The viral wave is real. Join me: ",
  progress_update: "Building in public on PROFITHACK AI 💪 Day [X] of creating content and earning as a creator: ",
  achievement: "New milestone unlocked on PROFITHACK AI! 🏆 This platform makes monetization so easy: ",
};

export function ShareProgress({ milestone, videoId, trigger }: ShareProgressProps) {
  const [open, setOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  const shareMutation = useMutation({
    mutationFn: async (data: {
      platform: string;
      shareType: string;
      shareText: string;
      videoId?: string;
      milestoneType?: string;
    }) => {
      const res = await apiRequest("POST", "/api/viral/share", data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Share Recorded! 🎉",
        description: `You earned ${data.earnedCredits} bonus credits for building in public!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record share. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && milestone) {
      // Auto-populate share text with template
      const template =
        SHARE_TEMPLATES[milestone.type as keyof typeof SHARE_TEMPLATES] ||
        SHARE_TEMPLATES.progress_update;
      setShareText(template + window.location.origin);
    }
    setOpen(newOpen);
  };

  const handleShare = (platform: string) => {
    setSelectedPlatform(platform);

    // Open share window based on platform
    const encodedText = encodeURIComponent(shareText);
    const shareUrl = window.location.origin + (videoId ? `/video/${videoId}` : "");
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareWindow = "";
    switch (platform) {
      case "twitter":
        shareWindow = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareWindow = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "linkedin":
        shareWindow = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (shareWindow) {
      window.open(shareWindow, "_blank", "width=600,height=400");
      
      // Record the share
      shareMutation.mutate({
        platform,
        shareType: milestone?.type || "progress_update",
        shareText,
        videoId,
        milestoneType: milestone?.type,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-share-progress">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]" data-testid="dialog-share-progress">
        <DialogHeader>
          <DialogTitle>Share Your Journey 🚀</DialogTitle>
          <DialogDescription>
            Build in public and earn bonus credits! Share your progress on social media.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Text Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Share Message</label>
            <Textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Share your journey, milestone, or achievement..."
              rows={4}
              data-testid="textarea-share-message"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Add your personal story for better engagement!
            </p>
          </div>

          {/* Platform Buttons */}
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Platform</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleShare("twitter")}
                disabled={!shareText || shareMutation.isPending}
                className="gap-2"
                data-testid="button-share-twitter"
              >
                <Twitter className="h-4 w-4" />
                Twitter/X
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                disabled={!shareText || shareMutation.isPending}
                variant="outline"
                className="gap-2"
                data-testid="button-share-facebook"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare("linkedin")}
                disabled={!shareText || shareMutation.isPending}
                variant="outline"
                className="gap-2"
                data-testid="button-share-linkedin"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Rewards Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <Gift className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Earn Bonus Credits!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get 50 credits for each share. Build your audience while earning rewards!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
