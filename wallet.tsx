import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction } from "@shared/schema";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Globe,
  Smartphone,
  Bitcoin,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState } from "react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"creator" | "innovator" | null>(null);
  const [momoPhoneNumber, setMomoPhoneNumber] = useState("");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: payoneerConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payoneer/configured"],
  });

  const { data: payeerConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payeer/configured"],
  });

  const { data: squareConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/square/configured"],
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (tier: "creator" | "innovator") => {
      return await apiRequest("/api/create-checkout-session", "POST", {
        tier,
      });
    },
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
      });
    },
  });

  const payoneerCheckoutMutation = useMutation({
    mutationFn: async (tier: "creator" | "innovator"): Promise<{ sessionUrl: string }> => {
      const response = await apiRequest("/api/payoneer/init-checkout", "POST", { tier });
      return response.json();
    },
    onSuccess: (data: { sessionUrl: string }) => {
      window.location.href = data.sessionUrl;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create Payoneer checkout. Please try again.",
      });
    },
  });

  const payeerCheckoutMutation = useMutation({
    mutationFn: async (tier: "creator" | "innovator"): Promise<{ invoiceUrl: string }> => {
      const response = await apiRequest("/api/payeer/init-checkout", "POST", { tier });
      return response.json();
    },
    onSuccess: (data: { invoiceUrl: string }) => {
      window.location.href = data.invoiceUrl;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create Payeer checkout. Please try again.",
      });
    },
  });

  const cryptoPaymentMutation = useMutation({
    mutationFn: async (amount: number): Promise<{ paymentUrl: string; credits: number }> => {
      const response = await apiRequest("/api/payments/crypto/create", "POST", { amount });
      return response.json();
    },
    onSuccess: (data: { paymentUrl: string; credits: number }) => {
      toast({
        title: "Redirecting to Payment",
        description: `You'll receive ${data.credits} credits after payment`,
      });
      window.location.href = data.paymentUrl;
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create crypto payment",
      });
    },
  });

  const { data: cryptoStatus } = useQuery<{
    configured: boolean;
    supportedCurrencies: string[];
    conversionRate: number;
  }>({
    queryKey: ["/api/payments/crypto/status"],
  });

  const { data: momoConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/momo/configured"],
  });

  const { data: paypalConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/paypal/configured"],
  });

  const paypalSubscriptionMutation = useMutation({
    mutationFn: async (tier: "creator" | "innovator"): Promise<{ approvalUrl: string }> => {
      const response = await apiRequest("/api/paypal/init-checkout", "POST", { tier });
      return response.json();
    },
    onSuccess: (data: { approvalUrl: string }) => {
      window.location.href = data.approvalUrl;
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create PayPal checkout. Please try again.",
      });
    },
  });

  const momoSubscriptionMutation = useMutation({
    mutationFn: async (data: { tier: "creator" | "innovator"; phoneNumber: string }): Promise<{ referenceId: string; message: string }> => {
      const response = await apiRequest("/api/momo/subscription", "POST", data);
      return response.json();
    },
    onSuccess: (data: { referenceId: string; message: string }) => {
      toast({
        title: "Payment Initiated",
        description: data.message,
      });
      setSelectedTier(null);
      setMomoPhoneNumber("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create MoMo payment",
      });
    },
  });

  const squareSubscriptionMutation = useMutation({
    mutationFn: async (data: { tier: "creator" | "innovator"; sourceId: string }): Promise<{ success: boolean; credits: number; tier: string }> => {
      const response = await apiRequest("/api/square/subscription", "POST", data);
      return response.json();
    },
    onSuccess: (data: { success: boolean; credits: number; tier: string }) => {
      toast({
        title: "Payment Successful",
        description: `${data.credits} credits added to your account!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setSelectedTier(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process Square payment",
      });
    },
  });

  const squareCreditsMutation = useMutation({
    mutationFn: async (data: { amount: number; sourceId: string }): Promise<{ success: boolean; credits: number }> => {
      const response = await apiRequest("/api/square/credits", "POST", data);
      return response.json();
    },
    onSuccess: (data: { success: boolean; credits: number }) => {
      toast({
        title: "Credits Purchased",
        description: `${data.credits} credits added to your account!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to purchase credits",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "gift_sent":
      case "credit_purchase":
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "gift_received":
      case "subscription":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? "text-green-400" : "text-red-400";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your credits and earnings
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Credits
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user?.credits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${((user?.credits || 0) * 0.01).toFixed(2)} USD value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Plan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.subscriptionTier?.toUpperCase() || "EXPLORER"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.subscriptionTier === "explorer"
                ? "Free plan"
                : user?.subscriptionTier === "starter"
                  ? "$20/month"
                  : user?.subscriptionTier === "creator"
                    ? "$40/month"
                    : "$199/month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.subscriptionTier === "explorer"
                ? "100"
                : user?.subscriptionTier === "starter"
                  ? "500"
                  : user?.subscriptionTier === "creator"
                    ? "1,000"
                    : user?.subscriptionTier === "innovator"
                      ? "5,000"
                      : "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renews monthly
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Plans with Multi-Provider Support */}
      {user?.subscriptionTier === "explorer" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Choose Your Payment Method
            </CardTitle>
            <CardDescription>
              CreatorVerse accepts payments from anywhere in the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="crypto" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="crypto" data-testid="tab-crypto">
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Crypto
                </TabsTrigger>
                <TabsTrigger value="payoneer" data-testid="tab-payoneer">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payoneer
                </TabsTrigger>
                <TabsTrigger value="payeer" data-testid="tab-payeer">
                  <Wallet className="w-4 h-4 mr-2" />
                  Payeer
                </TabsTrigger>
                <TabsTrigger value="paypal" data-testid="tab-paypal">
                  <Globe className="w-4 h-4 mr-2" />
                  PayPal
                </TabsTrigger>
                <TabsTrigger value="square" data-testid="tab-square">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Square
                </TabsTrigger>
                <TabsTrigger value="momo" data-testid="tab-momo">
                  <Smartphone className="w-4 h-4 mr-2" />
                  MoMo
                </TabsTrigger>
              </TabsList>

              {/* Payoneer Payment - PRIMARY */}
              <TabsContent value="payoneer" className="space-y-4">
                {payoneerConfig?.configured ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Starter Plan</CardTitle>
                        <CardDescription>
                          Get started with AI workspace
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                          $20<span className="text-lg text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 500 credits/month</li>
                          <li>✓ AI Lab workspace</li>
                          <li>✓ Code assistance</li>
                          <li>✓ 10 projects</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => payoneerCheckoutMutation.mutate("starter")}
                          disabled={payoneerCheckoutMutation.isPending}
                          data-testid="button-payoneer-starter"
                        >
                          {payoneerCheckoutMutation.isPending
                            ? "Loading..."
                            : "Pay with Payoneer"}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border-primary/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Creator Plan</CardTitle>
                          <Badge variant="default">Popular</Badge>
                        </div>
                        <CardDescription>
                          Perfect for active creators
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                          $40<span className="text-lg text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 1,000 credits/month</li>
                          <li>✓ AI code assistance</li>
                          <li>✓ Priority video processing</li>
                          <li>✓ Advanced workspace features</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                          onClick={() => payoneerCheckoutMutation.mutate("creator")}
                          disabled={payoneerCheckoutMutation.isPending}
                          data-testid="button-payoneer-creator"
                        >
                          {payoneerCheckoutMutation.isPending
                            ? "Loading..."
                            : "Pay with Payoneer"}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Innovator Plan</CardTitle>
                        <CardDescription>
                          For professional creators
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                          $199<span className="text-lg text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 5,000 credits/month</li>
                          <li>✓ Everything in Creator</li>
                          <li>✓ Advanced AI features</li>
                          <li>✓ Custom deployment options</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => payoneerCheckoutMutation.mutate("innovator")}
                          disabled={payoneerCheckoutMutation.isPending}
                          data-testid="button-payoneer-innovator"
                        >
                          {payoneerCheckoutMutation.isPending
                            ? "Loading..."
                            : "Pay with Payoneer"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Payoneer Payment</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Payoneer is being configured. Accepts credit cards, debit cards, and local payment methods in 200+ countries.
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-left">
                        <strong>Supported globally:</strong> Visa, Mastercard, American Express, Discover, and local payment methods worldwide.
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Secure payments processed by Payoneer - Trusted by millions globally
                </p>
              </TabsContent>

              {/* Payeer Payment - PRIMARY */}
              <TabsContent value="payeer" className="space-y-4">
                {payeerConfig?.configured ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-primary/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Creator Plan</CardTitle>
                          <Badge variant="default">Popular</Badge>
                        </div>
                        <CardDescription>
                          Perfect for active creators
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                          $40<span className="text-lg text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 1,000 credits/month</li>
                          <li>✓ AI code assistance</li>
                          <li>✓ Priority video processing</li>
                          <li>✓ Advanced workspace features</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                          onClick={() => payeerCheckoutMutation.mutate("creator")}
                          disabled={payeerCheckoutMutation.isPending}
                          data-testid="button-payeer-creator"
                        >
                          {payeerCheckoutMutation.isPending
                            ? "Loading..."
                            : "Pay with Payeer"}
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Innovator Plan</CardTitle>
                        <CardDescription>
                          For professional creators
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                          $199<span className="text-lg text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 5,000 credits/month</li>
                          <li>✓ Everything in Creator</li>
                          <li>✓ Advanced AI features</li>
                          <li>✓ Custom deployment options</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => payeerCheckoutMutation.mutate("innovator")}
                          disabled={payeerCheckoutMutation.isPending}
                          data-testid="button-payeer-innovator"
                        >
                          {payeerCheckoutMutation.isPending
                            ? "Loading..."
                            : "Pay with Payeer"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Payeer E-Wallet Payment</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Payeer is being configured. Supports e-wallet payments, bank transfers, and cryptocurrency.
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-left">
                        <strong>Multiple payment options:</strong> Payeer wallet, Visa, Mastercard, Bitcoin, Ethereum, and more.
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Flexible payment options with Payeer - Popular in 200+ countries
                </p>
              </TabsContent>

              {/* Square Payment */}
              <TabsContent value="square" className="space-y-4">
                {squareConfig?.configured ? (
                  <>
                    <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <CreditCard className="w-10 h-10 text-orange-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Pay with Square</h3>
                          <p className="text-sm text-muted-foreground">
                            Secure credit card payment processing. Accepts Visa, Mastercard, Amex, Discover, and more.
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Sandbox Mode:</strong> Using test card token for development. In production, full card form will be available.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-primary/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Creator Plan</CardTitle>
                            <Badge variant="default">Popular</Badge>
                          </div>
                          <CardDescription>Perfect for active creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $29<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 1,000 credits/month</li>
                            <li>✓ AI code assistance</li>
                            <li>✓ Priority video processing</li>
                            <li>✓ Advanced workspace features</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600"
                            onClick={() => squareSubscriptionMutation.mutate({ tier: "creator", sourceId: "cnon:card-nonce-ok" })}
                            disabled={squareSubscriptionMutation.isPending}
                            data-testid="button-square-creator"
                          >
                            {squareSubscriptionMutation.isPending ? "Processing..." : "Pay with Square"}
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Innovator Plan</CardTitle>
                          <CardDescription>For professional creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $99<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 5,000 credits/month</li>
                            <li>✓ Everything in Creator</li>
                            <li>✓ Advanced AI features</li>
                            <li>✓ Custom deployment options</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => squareSubscriptionMutation.mutate({ tier: "innovator", sourceId: "cnon:card-nonce-ok" })}
                            disabled={squareSubscriptionMutation.isPending}
                            data-testid="button-square-innovator"
                          >
                            {squareSubscriptionMutation.isPending ? "Processing..." : "Pay with Square"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Square Payment Processing</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Square is being configured. Secure card payment processing with industry-leading fraud protection.
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-left">
                        <strong>Supports:</strong> Visa, Mastercard, American Express, Discover, Diners Club, and JCB cards.
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  Secure PCI-compliant payment processing - Trusted by millions of businesses worldwide
                </p>
              </TabsContent>

              {/* PayPal Payment */}
              <TabsContent value="paypal" className="space-y-4">
                {paypalConfig?.configured ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <Globe className="w-10 h-10 text-blue-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Pay with PayPal</h3>
                          <p className="text-sm text-muted-foreground">
                            Use your PayPal balance, debit card, or credit card. Trusted by millions worldwide.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-primary/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Creator Plan</CardTitle>
                            <Badge variant="default">Popular</Badge>
                          </div>
                          <CardDescription>Perfect for active creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $29<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 1,000 credits/month</li>
                            <li>✓ AI code assistance</li>
                            <li>✓ Priority video processing</li>
                            <li>✓ Advanced workspace features</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                            onClick={() => paypalSubscriptionMutation.mutate("creator")}
                            disabled={paypalSubscriptionMutation.isPending}
                            data-testid="button-paypal-creator"
                          >
                            {paypalSubscriptionMutation.isPending ? "Loading..." : "Pay with PayPal"}
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Innovator Plan</CardTitle>
                          <CardDescription>For professional creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $99<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 5,000 credits/month</li>
                            <li>✓ Everything in Creator</li>
                            <li>✓ Advanced AI features</li>
                            <li>✓ Custom deployment options</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => paypalSubscriptionMutation.mutate("innovator")}
                            disabled={paypalSubscriptionMutation.isPending}
                            data-testid="button-paypal-innovator"
                          >
                            {paypalSubscriptionMutation.isPending ? "Loading..." : "Pay with PayPal"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      Secure payments processed by PayPal - Use debit cards, credit cards, or PayPal balance
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Globe className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">PayPal Payment</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      PayPal integration is being configured. You'll be able to use debit cards, credit cards, and PayPal balance soon!
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* MTN MoMo Payment */}
              <TabsContent value="momo" className="space-y-4">
                {momoConfig?.configured ? (
                  <>
                    <div className="bg-gradient-to-br from-green-500/10 to-yellow-500/10 border border-green-500/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <Smartphone className="w-10 h-10 text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Pay with MTN Mobile Money</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Pay directly from your MTN MoMo wallet via USSD. Available in 17+ African countries.
                          </p>
                          <div className="flex gap-2 flex-wrap text-xs">
                            <Badge variant="outline" className="bg-green-500/10">🇬🇭 Ghana</Badge>
                            <Badge variant="outline" className="bg-green-500/10">🇺🇬 Uganda</Badge>
                            <Badge variant="outline" className="bg-green-500/10">🇷🇼 Rwanda</Badge>
                            <Badge variant="outline" className="bg-green-500/10">🇿🇲 Zambia</Badge>
                            <Badge variant="outline" className="bg-green-500/10">+13 more</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 max-w-md mx-auto">
                      <Label htmlFor="momo-phone" className="text-sm font-medium">
                        MTN Mobile Money Phone Number
                      </Label>
                      <Input
                        id="momo-phone"
                        type="tel"
                        placeholder="46733123453 (Sandbox: use test number)"
                        value={momoPhoneNumber}
                        onChange={(e) => setMomoPhoneNumber(e.target.value)}
                        className="mt-2"
                        data-testid="input-momo-phone"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Format: Country code + number (e.g., 256712345678 for Uganda). Sandbox test number: 46733123453
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-primary/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Creator Plan</CardTitle>
                            <Badge variant="default">Popular</Badge>
                          </div>
                          <CardDescription>Perfect for active creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $29<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 1,000 credits/month</li>
                            <li>✓ AI code assistance</li>
                            <li>✓ Priority video processing</li>
                            <li>✓ Advanced workspace features</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full bg-gradient-to-r from-green-500 to-yellow-600"
                            onClick={() => momoSubscriptionMutation.mutate({ tier: "creator", phoneNumber: momoPhoneNumber })}
                            disabled={momoSubscriptionMutation.isPending || !momoPhoneNumber}
                            data-testid="button-momo-creator"
                          >
                            {momoSubscriptionMutation.isPending ? "Processing..." : "Pay with MoMo"}
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Innovator Plan</CardTitle>
                          <CardDescription>For professional creators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold">
                            $99<span className="text-lg text-muted-foreground">/mo</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ 5,000 credits/month</li>
                            <li>✓ Everything in Creator</li>
                            <li>✓ Advanced AI features</li>
                            <li>✓ Custom deployment options</li>
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => momoSubscriptionMutation.mutate({ tier: "innovator", phoneNumber: momoPhoneNumber })}
                            disabled={momoSubscriptionMutation.isPending || !momoPhoneNumber}
                            data-testid="button-momo-innovator"
                          >
                            {momoSubscriptionMutation.isPending ? "Processing..." : "Pay with MoMo"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground text-center">
                        📱 You'll receive a USSD prompt on your phone to approve the payment
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      Secure mobile payments - No bank account or card needed
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Smartphone className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">MTN MoMo Payment</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      MTN Mobile Money is available in Ghana, Uganda, Rwanda, Zambia, and 13 other African countries.
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-left">
                        <strong>Coming Soon:</strong> Pay with your MTN MoMo wallet directly from your phone. No bank account needed!
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Crypto Payment - FIRST TAB */}
              <TabsContent value="crypto" className="space-y-4">
                {cryptoStatus?.configured ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <Bitcoin className="w-10 h-10 text-purple-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Borderless Crypto Payments</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Pay with Bitcoin, Ethereum, USDT, or USDC from anywhere in the world. Perfect for Bermuda and regions without traditional payment methods.
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {cryptoStatus.supportedCurrencies.map((currency) => (
                              <Badge key={currency} variant="outline" className="bg-purple-500/10">
                                {currency}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { amount: 10, credits: 500, popular: false },
                        { amount: 50, credits: 2500, popular: true },
                        { amount: 100, credits: 5000, popular: false },
                      ].map((pkg) => (
                        <Card key={pkg.amount} className={pkg.popular ? "border-purple-500/50" : ""}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl">${pkg.amount}</CardTitle>
                              {pkg.popular && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{pkg.credits.toLocaleString()} Credits</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              Best for {pkg.amount === 10 ? "trying it out" : pkg.amount === 50 ? "regular use" : "power users"}
                            </p>
                            <Button
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                              onClick={() => cryptoPaymentMutation.mutate(pkg.amount)}
                              disabled={cryptoPaymentMutation.isPending}
                              data-testid={`button-crypto-buy-${pkg.amount}`}
                            >
                              {cryptoPaymentMutation.isPending ? "Processing..." : "Buy with Crypto"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>Secure payments powered by CoinGate</p>
                      <p>Rate: ${cryptoStatus.conversionRate || 50} credits per $1 USD</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Bitcoin className="w-12 h-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Crypto Payments</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Cryptocurrency payments are being configured. This will enable borderless payments for users worldwide.
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-left">
                        <strong>Coming Soon:</strong> Pay with Bitcoin (BTC), Ethereum (ETH), USDT, or USDC directly from your crypto wallet.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">
                          {transaction.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(transaction.createdAt!)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${getTransactionColor(transaction.amount)}`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
