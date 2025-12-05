import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/logo6_1763894382467.png";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("betaBannerDismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }

    // Calculate days remaining until launch
    const launchDate = new Date("2026-02-24T00:00:00");
    const now = new Date();
    const diff = launchDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysRemaining(days);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("betaBannerDismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <img src={logoImage} alt="PROFITHACK AI" className="w-8 h-8 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                BETA
              </Badge>
              <span className="font-semibold">
                You're experiencing PROFITHACK AI early!
              </span>
              <span className="hidden sm:inline text-white/90">
                Full launch: February 24, 2026
              </span>
              {daysRemaining > 0 && (
                <span className="flex items-center gap-1 text-sm bg-white/10 px-2 py-1 rounded">
                  <Calendar className="w-3 h-3" />
                  {daysRemaining} days to go
                </span>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="hover:bg-white/20 text-white"
            data-testid="button-dismiss-beta-banner"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
