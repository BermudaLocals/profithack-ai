import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Rocket, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Platform subscription tiers (not premium creator subscriptions)
const SUBSCRIPTION_TIERS = [
  {
    id: "explorer",
    name: "Explorer",
    price: 0,
    credits: 0,
    features: [
      "For You feed access",
      "Vids (short videos)",
      "DMs (messaging)",
      "Video calls",
      "Tube (long videos)",
      "NO workspace access",
    ],
    icon: Sparkles,
    color: "from-gray-500 to-gray-600",
  },
  {
    id: "creator",
    name: "Creator",
    price: 29,
    credits: 1000,
    features: [
      "Everything in Explorer",
      "AI Lab workspace access",
      "Monaco code editor",
      "1,000 monthly credits",
      "AI code assistance",
      "Priority support",
    ],
    icon: Zap,
    color: "from-pink-500 to-purple-500",
    popular: true,
  },
  {
    id: "innovator",
    name: "Innovator",
    price: 99,
    credits: 5000,
    features: [
      "Everything in Creator",
      "5,000 monthly credits",
      "Advanced AI models",
      "Priority queue access",
      "Custom integrations",
      "Early feature access",
    ],
    icon: Rocket,
    color: "from-purple-500 to-cyan-400",
  },
];

export default function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<"creator" | "innovator">("creator");
  const [paypalClientToken, setPaypalClientToken] = useState<string | null>(null);

  // Fetch PayPal client token
  const { data: paypalData } = useQuery<{ clientToken: string }>({
    queryKey: ["/api/paypal/load"],
    enabled: true,
  });

  useEffect(() => {
    if (paypalData?.clientToken) {
      setPaypalClientToken(paypalData.clientToken);
    }
  }, [paypalData]);

  const captureMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // No longer pass tier - server validates from session
      const res = await apiRequest("POST", `/api/paypal/capture/${orderId}`);
      return await res.json();
    },
    onSuccess: async () => {
      toast({
        title: "Subscription Activated! 🎉",
        description: "Your subscription has been successfully activated!",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (tier: "creator" | "innovator") => {
      const res = await apiRequest("POST", "/api/paypal/create-subscription", { tier });
      return await res.json();
    },
  });

  const currentTierIndex = SUBSCRIPTION_TIERS.findIndex(t => t.id === user?.subscriptionTier);

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
              You must be 18+ and verify your age to access premium features.
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
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          Unlock Your Potential
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the perfect plan to supercharge your creativity with AI-powered tools and workspace access
        </p>
      </div>

      {/* Current Tier Badge */}
      {user?.subscriptionTier && (
        <div className="text-center mb-8">
          <Badge variant="default" className="px-4 py-2 text-sm">
            Current Plan: {SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.name || "Explorer"}
          </Badge>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {SUBSCRIPTION_TIERS.map((tier, index) => {
          const Icon = tier.icon;
          const isCurrentTier = tier.id === user?.subscriptionTier;
          const isDowngrade = currentTierIndex > index;
          
          return (
            <Card
              key={tier.id}
              className={`relative overflow-hidden ${
                tier.popular ? "ring-2 ring-primary shadow-lg scale-105" : ""
              } ${isCurrentTier ? "border-primary" : ""}`}
              data-testid={`tier-card-${tier.id}`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              {isCurrentTier && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-br-lg">
                  CURRENT PLAN
                </div>
              )}

              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-foreground">
                      ${tier.price}
                    </span>
                    {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                  {tier.credits > 0 && (
                    <p className="text-sm text-primary mt-2">
                      {tier.credits.toLocaleString()} credits/month
                    </p>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.price === 0 ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    Free Forever
                  </Button>
                ) : isCurrentTier ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                    data-testid={`button-subscribe-${tier.id}`}
                  >
                    Cannot Downgrade
                  </Button>
                ) : (
                  <PayPalScriptProvider
                    options={{
                      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
                      currency: "USD",
                      intent: "capture",
                      dataClientToken: paypalClientToken || undefined,
                    }}
                  >
                    <PayPalButtons
                      createOrder={async () => {
                        setSelectedTier(tier.id as "creator" | "innovator");
                        const result = await createOrderMutation.mutateAsync(tier.id as "creator" | "innovator");
                        return result.id;
                      }}
                      onApprove={async (data) => {
                        await captureMutation.mutateAsync(data.orderID);
                      }}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        toast({
                          title: "Payment Error",
                          description: "Failed to process payment. Please try again.",
                          variant: "destructive",
                        });
                      }}
                      style={{
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "subscribe",
                      }}
                    />
                  </PayPalScriptProvider>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Global Payment Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We accept PayPal, Cryptocurrency (BTC, ETH, USDT, USDC), Payoneer, MTN Mobile Money, and more. 
              Built for creators worldwide, including regions without Stripe.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cancel Anytime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No commitment required. Cancel your subscription anytime from your wallet settings. 
              Your credits remain active until the end of your billing period.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
