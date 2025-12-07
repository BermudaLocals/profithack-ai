import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Sparkles, Crown, Zap, Star, Timer, DollarSign } from "lucide-react";
import type { PremiumUsername } from "@shared/schema";

function formatPrice(credits: number): string {
  return `$${(credits / 100).toFixed(2)}`;
}

function getTierBadge(tier: string) {
  const badges = {
    standard: { label: "Standard", color: "bg-slate-700 text-slate-200" },
    premium: { label: "Premium", color: "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30" },
    elite: { label: "Elite", color: "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border border-purple-500/30" },
    celebrity: { label: "Celebrity", color: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30" },
  };
  return badges[tier as keyof typeof badges] || badges.standard;
}

function getTierIcon(tier: string) {
  const icons = {
    standard: Star,
    premium: Sparkles,
    elite: Zap,
    celebrity: Crown,
  };
  const Icon = icons[tier as keyof typeof icons] || Star;
  return <Icon className="w-4 h-4" />;
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const { toast } = useToast();

  const { data: usernames = [], isLoading } = useQuery<PremiumUsername[]>({
    queryKey: ["/api/usernames", selectedTier, searchQuery],
    enabled: true,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (usernameId: string) => {
      const response = await fetch(`/api/usernames/${usernameId}/purchase`, {
        method: "POST",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: "Username has been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/usernames"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bidMutation = useMutation({
    mutationFn: async ({ usernameId, bidAmount }: { usernameId: string; bidAmount: number }) => {
      const response = await fetch(`/api/usernames/${usernameId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid placed!",
        description: "Your bid has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/usernames"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bid failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsernames = usernames.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === "all" || u.tier === selectedTier;
    return matchesSearch && matchesTier && u.status !== "purchased";
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Premium Username Marketplace
          </h1>
          <p className="text-slate-400">
            Secure your identity with exclusive usernames. Short names, celebrity handles, and premium brands available.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              data-testid="input-search-username"
              placeholder="Search usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <Tabs value={selectedTier} onValueChange={setSelectedTier} className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="all" data-testid="filter-all">All Tiers</TabsTrigger>
              <TabsTrigger value="premium" data-testid="filter-premium">Premium</TabsTrigger>
              <TabsTrigger value="elite" data-testid="filter-elite">Elite</TabsTrigger>
              <TabsTrigger value="celebrity" data-testid="filter-celebrity">Celebrity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Username Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 animate-pulse">
                <CardHeader className="h-32 bg-slate-800 rounded-t-lg" />
                <CardContent className="pt-6">
                  <div className="h-6 bg-slate-800 rounded mb-4" />
                  <div className="h-4 bg-slate-800 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsernames.map((username) => {
              const tierBadge = getTierBadge(username.tier);
              const isAuction = username.status === "auction";
              const currentPrice = username.currentBidCredits || username.priceCredits;

              return (
                <Card
                  key={username.id}
                  data-testid={`card-username-${username.id}`}
                  className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={tierBadge.color}>
                        <span className="flex items-center gap-1">
                          {getTierIcon(username.tier)}
                          {tierBadge.label}
                        </span>
                      </Badge>
                      {isAuction && (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          <Timer className="w-3 h-3 mr-1" />
                          Auction
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      @{username.username}
                    </CardTitle>
                    {username.description && (
                      <CardDescription className="text-slate-400">
                        {username.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">
                          {isAuction ? "Current Bid" : "Price"}
                        </p>
                        <p className="text-2xl font-bold text-cyan-400 flex items-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          {formatPrice(currentPrice)}
                        </p>
                        <p className="text-xs text-slate-500">{currentPrice.toLocaleString()} credits</p>
                      </div>
                    </div>

                    {isAuction && username.auctionEndDate && (
                      <div className="text-sm text-slate-400">
                        <p>Ends: {new Date(username.auctionEndDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    {username.tags && username.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {username.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-slate-700 text-slate-400 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isAuction ? (
                        <Button
                          data-testid={`button-bid-${username.id}`}
                          onClick={() => {
                            const newBid = currentPrice + 100; // $1.00 increment
                            bidMutation.mutate({ usernameId: username.id, bidAmount: newBid });
                          }}
                          disabled={bidMutation.isPending}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold"
                        >
                          {bidMutation.isPending ? "Placing Bid..." : "Place Bid +$1"}
                        </Button>
                      ) : (
                        <Button
                          data-testid={`button-purchase-${username.id}`}
                          onClick={() => purchaseMutation.mutate(username.id)}
                          disabled={purchaseMutation.isPending}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold"
                        >
                          {purchaseMutation.isPending ? "Processing..." : "Purchase Now"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredUsernames.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400 text-lg">No usernames found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
