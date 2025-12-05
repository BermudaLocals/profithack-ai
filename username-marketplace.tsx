import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AtSign, TrendingUp, Crown, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PremiumUsername {
  id: number;
  username: string;
  price: number;
  category: "rare" | "premium" | "legendary";
  views: number;
  likes: number;
  ownerId: number | null;
  ownerName: string | null;
  status: "available" | "owned" | "auction";
}

export default function UsernameMarketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usernames = [], isLoading } = useQuery<PremiumUsername[]>({
    queryKey: ["/api/usernames"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (usernameId: number) => {
      return apiRequest(`/api/usernames/${usernameId}/purchase`, {
        method: "POST",
        body: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usernames"] });
      toast({
        title: "Username Purchased! ⚡",
        description: "Congratulations! This premium username is now yours!",
      });
    }
  });

  const getCategoryColor = (category: PremiumUsername["category"]) => {
    switch (category) {
      case "legendary": return "from-yellow-500 to-orange-500";
      case "premium": return "from-purple-500 to-pink-500";
      case "rare": return "from-cyan-500 to-blue-500";
    }
  };

  const getCategoryBadge = (category: PremiumUsername["category"]) => {
    switch (category) {
      case "legendary": return { text: "LEGENDARY", icon: <Crown className="w-3 h-3" />, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" };
      case "premium": return { text: "PREMIUM", icon: <Zap className="w-3 h-3" />, class: "bg-purple-500/20 text-purple-400 border-purple-500/50" };
      case "rare": return { text: "RARE", icon: <TrendingUp className="w-3 h-3" />, class: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" };
    }
  };

  const filteredUsernames = usernames.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AtSign className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <AtSign className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Premium Username Marketplace
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Buy, sell, and trade rare usernames - Your identity, your investment
          </p>
          <div className="flex gap-4 flex-wrap">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              <Crown className="w-3 h-3 mr-1" />
              {usernames.filter(u => u.category === "legendary").length} Legendary
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Zap className="w-3 h-3 mr-1" />
              {usernames.filter(u => u.category === "premium").length} Premium
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              <TrendingUp className="w-3 h-3 mr-1" />
              {usernames.filter(u => u.status === "available").length} Available
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
              data-testid="input-search-username"
            />
          </div>
        </div>

        {/* Categories */}
        {["legendary", "premium", "rare"].map((category) => {
          const categoryUsernames = filteredUsernames.filter(u => u.category === category);
          if (categoryUsernames.length === 0) return null;

          const badge = getCategoryBadge(category as PremiumUsername["category"]);
          const gradient = getCategoryColor(category as PremiumUsername["category"]);

          return (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} Usernames
                </h2>
                <Badge className={badge.class}>
                  {badge.icon}
                  <span className="ml-1">{categoryUsernames.length}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryUsernames.map((username) => (
                  <Card 
                    key={username.id}
                    className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all"
                    data-testid={`card-username-${username.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={badge.class}>
                          {badge.icon}
                          <span className="ml-1">{badge.text}</span>
                        </Badge>
                        {username.status === "available" && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardTitle className={`text-2xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        @{username.username}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {username.views.toLocaleString()} views • {username.likes.toLocaleString()} likes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Price</span>
                        <p className="text-2xl font-bold text-white">
                          ${username.price.toLocaleString()}
                        </p>
                      </div>

                      {username.status === "owned" ? (
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                          <p className="text-sm text-cyan-400">
                            Owned by @{username.ownerName}
                          </p>
                        </div>
                      ) : username.status === "auction" ? (
                        <Button 
                          variant="outline"
                          className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          data-testid={`button-bid-${username.id}`}
                        >
                          Place Bid
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => purchaseMutation.mutate(username.id)}
                          disabled={purchaseMutation.isPending}
                          className={`w-full bg-gradient-to-r ${gradient} text-white border-0`}
                          data-testid={`button-buy-${username.id}`}
                        >
                          {purchaseMutation.isPending ? "Processing..." : "Buy Now"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredUsernames.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <AtSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No usernames found matching "{searchQuery}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
