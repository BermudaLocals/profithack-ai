import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type TourStep = {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
};

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to PROFITHACK AI! 🚀",
    description: "The ultimate platform for creators to monetize content and build AI-powered apps. Let's show you around!",
    position: "center",
  },
  {
    id: "feed",
    title: "Discover Amazing Content",
    description: "Swipe up/down or scroll to browse videos. Double-tap to like, tap once to pause.",
    targetSelector: "[data-testid^='video-player']",
    position: "bottom",
  },
  {
    id: "discover",
    title: "Explore Trending",
    description: "Tap the Discover icon to find trending videos, hashtags, and categories.",
    targetSelector: "[data-testid='nav-discover']",
    position: "top",
  },
  {
    id: "create",
    title: "Upload Your Content",
    description: "Tap the + button to upload videos and start earning. Short videos (9:16) perform best!",
    targetSelector: "[data-testid='nav-create']",
    position: "top",
  },
  {
    id: "messages",
    title: "Connect with Fans",
    description: "Message your followers, offer premium content, and build your community.",
    targetSelector: "[data-testid='nav-messages']",
    position: "top",
  },
  {
    id: "ailab",
    title: "AI Code Workspace",
    description: "Build AI apps, create marketing bots, and automate your content creation with our AI Lab.",
    targetSelector: "[data-testid='link-ai lab']",
    position: "right",
  },
  {
    id: "earnings",
    title: "Track Your Money",
    description: "Check your earnings, wallet balance, and analytics. You earn 60% of all revenue you generate!",
    targetSelector: "[data-testid='link-wallet']",
    position: "right",
  },
];

export function FTUETour() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem(`ftue_tour_completed_${user?.id}`);
    if (!hasSeenTour && user) {
      // Wait a bit before showing tour to let page load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      setTargetElement(element);

      // Highlight the target element
      if (element) {
        element.style.position = 'relative';
        element.style.zIndex = '1001';
      }
    } else {
      setTargetElement(null);
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = '';
      }
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    if (user?.id) {
      localStorage.setItem(`ftue_tour_completed_${user.id}`, "true");
    }
    setIsOpen(false);
    setCurrentStep(0);
    // Clean up any lingering z-index changes
    if (targetElement) {
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isOpen || !user) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Calculate position based on target element
  const getPosition = () => {
    if (!targetElement || step.position === "center") {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const spacing = 16;

    switch (step.position) {
      case "top":
        return {
          position: "fixed" as const,
          bottom: `${window.innerHeight - rect.top + spacing}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          position: "fixed" as const,
          top: `${rect.bottom + spacing}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          position: "fixed" as const,
          right: `${window.innerWidth - rect.left + spacing}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          position: "fixed" as const,
          left: `${rect.right + spacing}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: "translateY(-50%)",
        };
      default:
        return {
          position: "fixed" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]"
        onClick={skipTour}
        data-testid="ftue-overlay"
      />

      {/* Tour Card */}
      <Card
        className="w-[90vw] max-w-md z-[1002] shadow-2xl border-2 border-primary/50"
        style={getPosition()}
        data-testid={`ftue-step-${step.id}`}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">{step.title}</h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={skipTour}
              className="h-8 w-8"
              data-testid="ftue-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6">{step.description}</p>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  data-testid="ftue-prev"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                data-testid="ftue-next"
              >
                {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                {currentStep < tourSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Skip button */}
          {currentStep < tourSteps.length - 1 && (
            <div className="mt-4 text-center">
              <button
                onClick={skipTour}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="ftue-skip"
              >
                Skip tour
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spotlight effect on target element */}
      {targetElement && (
        <div
          className="fixed z-[1001] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: "2px solid",
            borderImage: "linear-gradient(90deg, #ec4899, #a855f7, #22d3ee) 1",
            borderRadius: "8px",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          }}
        />
      )}
    </>
  );
}
