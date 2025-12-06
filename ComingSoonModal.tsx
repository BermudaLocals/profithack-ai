import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Rocket } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    id: string;
    title: string;
    description: string;
    benefits: string[];
    launchDate?: string;
  };
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  const [, setLocation] = useLocation();

  const trackInterest = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/features/interest", {
        method: "POST",
        body: { featureId: feature.id, timestamp: new Date().toISOString() }
      });
    }
  });

  const handleExploreNow = () => {
    trackInterest.mutate();
    onClose();
    setLocation("/feed?source=coming-soon");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <DialogTitle className="text-2xl bg-gradient-to-r from-primary via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              {feature.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3">
            <p className="text-foreground font-medium">{feature.description}</p>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                What You'll Get:
              </p>
              <ul className="space-y-1.5 ml-6">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">✨</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {feature.launchDate && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Launching: {feature.launchDate}
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground italic mt-3">
              🔥 We're tracking interest! Your click helps us prioritize what YOU want most.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleExploreNow}
            className="w-full bg-gradient-to-r from-primary via-pink-500 to-cyan-500 hover:opacity-90"
            data-testid="button-explore-trending"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Explore Trending Now
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            data-testid="button-close-modal"
          >
            Got It!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
