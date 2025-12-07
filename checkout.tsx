import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Zap, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const COIN_PACKAGES = [
  { coins: 70, price: 1.00, label: "$1" },
  { coins: 350, price: 5.00, label: "$5", popular: false },
  { coins: 700, price: 10.00, label: "$10", popular: true },
  { coins: 3500, price: 50.00, label: "$50", popular: false },
  { coins: 7000, price: 100.00, label: "$100", popular: false },
];

const CREDIT_PACKAGES = [
  { credits: 100, price: 2.40, label: "100 Credits" },
  { credits: 500, price: 12.00, label: "500 Credits", popular: false },
  { credits: 1000, price: 24.00, label: "1,000 Credits", popular: true },
  { credits: 5000, price: 120.00, label: "5,000 Credits", popular: false },
  { credits: 10000, price: 240.00, label: "10,000 Credits", popular: false },
];

export default function CheckoutPage() {
  const [selectedCoinPackage, setSelectedCoinPackage] = useState(COIN_PACKAGES[2]);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState(CREDIT_PACKAGES[2]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async (data: { type: "coins" | "credits"; amount: number; priceCents: number }) => {
      return apiRequest("POST", "/api/payments/purchase", data);
    },
    onSuccess: () => {
      toast({ title: "Purchase successful!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user/balance"] });
    },
    onError: () => {
      toast({ title: "Purchase failed", variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Get Coins & Credits</h1>
        <p className="text-muted-foreground mt-2">
          Coins for social features • Credits for AI tools & premium content
        </p>
      </div>

      <Tabs defaultValue="coins" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coins" data-testid="tab-coins">
            <Coins className="w-4 h-4 mr-2" />
            Coins
          </TabsTrigger>
          <TabsTrigger value="credits" data-testid="tab-credits">
            <Zap className="w-4 h-4 mr-2" />
            Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buy Coins</CardTitle>
              <CardDescription>70 coins = $1 USD • Use for gifts, tips & social features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {COIN_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.coins}
                    data-testid={`package-coins-${pkg.coins}`}
                    className={`cursor-pointer transition-all ${
                      selectedCoinPackage.coins === pkg.coins
                        ? "ring-2 ring-primary"
                        : "hover-elevate"
                    } ${pkg.popular ? "border-primary" : ""}`}
                    onClick={() => setSelectedCoinPackage(pkg)}
                  >
                    <CardContent className="pt-6 text-center">
                      {pkg.popular && (
                        <div className="text-xs font-semibold text-primary mb-2">POPULAR</div>
                      )}
                      <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <div className="text-2xl font-bold">{pkg.coins}</div>
                      <div className="text-sm text-muted-foreground">coins</div>
                      <div className="text-lg font-semibold mt-2">{pkg.label}</div>
                      {selectedCoinPackage.coins === pkg.coins && (
                        <Check className="w-5 h-5 mx-auto mt-2 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                data-testid="button-buy-coins"
                className="w-full mt-6"
                size="lg"
                onClick={() =>
                  purchaseMutation.mutate({
                    type: "coins",
                    amount: selectedCoinPackage.coins,
                    priceCents: Math.round(selectedCoinPackage.price * 100),
                  })
                }
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending
                  ? "Processing..."
                  : `Buy ${selectedCoinPackage.coins} Coins for $${selectedCoinPackage.price.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buy Credits</CardTitle>
              <CardDescription>1 credit = $0.024 USD • Use for AI tools & premium subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {CREDIT_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.credits}
                    data-testid={`package-credits-${pkg.credits}`}
                    className={`cursor-pointer transition-all ${
                      selectedCreditPackage.credits === pkg.credits
                        ? "ring-2 ring-primary"
                        : "hover-elevate"
                    } ${pkg.popular ? "border-primary" : ""}`}
                    onClick={() => setSelectedCreditPackage(pkg)}
                  >
                    <CardContent className="pt-6 text-center">
                      {pkg.popular && (
                        <div className="text-xs font-semibold text-primary mb-2">POPULAR</div>
                      )}
                      <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{pkg.credits.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">credits</div>
                      <div className="text-lg font-semibold mt-2">${pkg.price.toFixed(2)}</div>
                      {selectedCreditPackage.credits === pkg.credits && (
                        <Check className="w-5 h-5 mx-auto mt-2 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                data-testid="button-buy-credits"
                className="w-full mt-6"
                size="lg"
                onClick={() =>
                  purchaseMutation.mutate({
                    type: "credits",
                    amount: selectedCreditPackage.credits,
                    priceCents: Math.round(selectedCreditPackage.price * 100),
                  })
                }
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending
                  ? "Processing..."
                  : `Buy ${selectedCreditPackage.credits.toLocaleString()} Credits for $${selectedCreditPackage.price.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
