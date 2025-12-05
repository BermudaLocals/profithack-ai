import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown, Video, Lock, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PremiumModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isPremiumCreator?: boolean;
  subscriberCount?: number;
}

interface PremiumSubscription {
  id: string;
  creatorId: string;
  tier: string;
  status: string;
}

const PREMIUM_TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: 19.99,
    features: [
      "720p HD Streaming",
      "Chat Access",
      "View Photos & Videos",
      "Monthly Exclusive Content",
    ],
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "vip",
    name: "VIP",
    price: 39.99,
    features: [
      "Everything in Basic",
      "1080p Full HD Streaming",
      "Priority Chat",
      "Exclusive VIP Content",
      "Weekly Private Shows",
    ],
    color: "from-purple-500 to-pink-500",
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: 99.99,
    features: [
      "Everything in VIP",
      "4K Ultra HD Streaming",
      "Private 1-on-1 Shows",
      "Interactive Toy Control",
      "Daily Exclusive Content",
      "Priority Booking",
    ],
    color: "from-cyan-500 to-purple-500",
  },
];

export default function PremiumModels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<PremiumModel | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("vip");

  const { data: models, isLoading: modelsLoading } = useQuery<PremiumModel[]>({
    queryKey: ["/api/premium/models"],
  });

  const { data: mySubscriptions } = useQuery<PremiumSubscription[]>({
    queryKey: ["/api/premium/my-subscriptions"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ modelId, tier }: { modelId: string; tier: string }) => {
      const tierData = PREMIUM_TIERS.find(t => t.id === tier);
      const amountCents = Math.round(tierData!.price * 100);
      const res = await apiRequest("POST", "/api/premium/subscribe", {
        modelId,
        tier,
        amountCents,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Activated! 🎉",
        description: "You now have access to premium content",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/premium/my-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSelectedModel(null);
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const isSubscribed = (modelId: string) => {
    return mySubscriptions?.some(
      sub => sub.creatorId === modelId && sub.status === "active"
    );
  };

  if (!user?.ageVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Age Verification Required
            </CardTitle>
            <CardDescription>
              You must be 18+ and verify your age to access premium models.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild data-testid="button-verify-age">
              <a href="/onboarding">Verify Your Age</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          Premium Models
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Subscribe to your favorite creators for exclusive content and private shows
        </p>
      </div>

      {modelsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="pt-6 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models?.map(model => (
            <Card
              key={model.id}
              className="overflow-hidden hover-elevate cursor-pointer"
              onClick={() => setSelectedModel(model)}
              data-testid={`model-card-${model.id}`}
            >
              <div className="relative h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Avatar className="absolute inset-0 w-full h-full rounded-none">
                  <AvatarImage src={model.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-4xl rounded-none">
                    {model.firstName?.[0]}{model.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isSubscribed(model.id) && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Subscribed
                  </Badge>
                )}
              </div>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">
                  {model.firstName} {model.lastName}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {model.bio || "Premium creator"}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-primary" />
                    <span>{model.subscriberCount || 0} subs</span>
                  </div>
                  <Badge variant="outline">18+</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedModel?.avatarUrl} />
                <AvatarFallback>
                  {selectedModel?.firstName?.[0]}{selectedModel?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl">
                  {selectedModel?.firstName} {selectedModel?.lastName}
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  Premium Creator
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedModel?.bio || "Subscribe for exclusive content"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {PREMIUM_TIERS.map(tier => {
              const isCurrentTier = selectedTier === tier.id;
              return (
                <Card
                  key={tier.id}
                  className={`relative ${tier.popular ? "ring-2 ring-primary scale-105" : ""} ${
                    isCurrentTier ? "border-primary" : ""
                  }`}
                  data-testid={`tier-option-${tier.id}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded-bl-lg">
                      POPULAR
                    </div>
                  )}

                  <CardHeader>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-2`}>
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-foreground">
                          ${tier.price}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentTier ? "default" : "outline"}
                      onClick={() => setSelectedTier(tier.id)}
                      data-testid={`button-select-${tier.id}`}
                    >
                      {isCurrentTier ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedModel(null)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            {isSubscribed(selectedModel?.id || "") ? (
              <Button className="flex-1" data-testid="button-enter-room">
                <Video className="w-4 h-4 mr-2" />
                Enter Room
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() =>
                  subscribeMutation.mutate({
                    modelId: selectedModel!.id,
                    tier: selectedTier,
                  })
                }
                disabled={subscribeMutation.isPending}
                data-testid="button-subscribe"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {subscribeMutation.isPending ? "Processing..." : `Subscribe Now`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
