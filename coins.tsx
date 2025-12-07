import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Gift, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { COIN_PACKAGES } from "@shared/coin-packages";

export default function CoinsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const purchaseCoinsMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest("/api/wallet/purchase-coins", "POST", {
        packageId,
      });
      return response.json();
    },
    onSuccess: (data: { success: boolean; coins: number; message: string }) => {
      toast({
        title: "Purchase Successful!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Failed to purchase coins. Please try again.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Purchase Coins
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Send gifts, support creators, and unlock exclusive content
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Coins className="w-3 h-3 mr-1" />
              Your Balance: {user?.coins || 0} coins
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {COIN_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden hover-elevate ${
                pkg.popular ? "border-2 border-pink-500" : ""
              }`}
              data-testid={`card-coin-package-${pkg.id}`}
            >
              {pkg.popular && (
                <Badge className="absolute top-4 right-4 bg-pink-500 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              {pkg.bonus && (
                <Badge className="absolute top-4 left-4 bg-purple-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  +{pkg.bonus}% Bonus
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  {pkg.coins.toLocaleString()} Coins
                </CardTitle>
                <CardDescription className="text-lg">
                  ${pkg.priceUSD.toFixed(2)} USD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {pkg.description}
                  </p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => purchaseCoinsMutation.mutate(pkg.id)}
                  disabled={purchaseCoinsMutation.isPending}
                  data-testid={`button-purchase-${pkg.id}`}
                >
                  {purchaseCoinsMutation.isPending ? "Processing..." : `Purchase ${pkg.coins} Coins`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-pink-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-500" />
              What are Coins?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Coins</strong> are the currency for social features on PROFITHACK AI:
            </p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>
                <strong className="text-foreground">Send Virtual Gifts (Sparks):</strong> Show appreciation to creators with animated gifts
              </li>
              <li>
                <strong className="text-foreground">Support Creators:</strong> 60% of gift value goes directly to creators (better than TikTok's 50%)
              </li>
              <li>
                <strong className="text-foreground">Unlock Premium Content:</strong> Access exclusive videos and private shows
              </li>
              <li>
                <strong className="text-foreground">TikTok Pricing:</strong> Same pricing model as TikTok (70 coins = $1.00)
              </li>
            </ul>
            <div className="bg-background/50 p-4 rounded-lg mt-4">
              <p className="text-sm">
                <strong className="text-foreground">Note:</strong> Coins are separate from Credits. Credits are used for AI tools (workspace, bots, automation) and come with subscriptions. Coins are for social features and purchased separately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
