import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame, Star, Rocket, CircleDot, Zap, Infinity, Crown, Gem } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Spark type definitions with pricing and icons
const SPARK_TYPES = [
  {
    type: "glow",
    name: "Glow",
    price: 5,
    icon: Sparkles,
    color: "from-yellow-400 to-orange-500",
    description: "A gentle warm glow",
  },
  {
    type: "blaze",
    name: "Blaze",
    price: 25,
    icon: Flame,
    color: "from-orange-500 to-red-600",
    description: "Animated fire effect",
  },
  {
    type: "stardust",
    name: "Stardust",
    price: 50,
    icon: Star,
    color: "from-blue-400 to-purple-500",
    description: "Particle explosion",
  },
  {
    type: "rocket",
    name: "Rocket",
    price: 100,
    icon: Rocket,
    color: "from-cyan-400 to-blue-600",
    description: "Rocket launch animation",
  },
  {
    type: "galaxy",
    name: "Galaxy",
    price: 500,
    icon: CircleDot,
    color: "from-purple-500 to-pink-600",
    description: "Cosmic swirl effect",
  },
  {
    type: "supernova",
    name: "Supernova",
    price: 1000,
    icon: Zap,
    color: "from-pink-500 to-red-600",
    description: "Massive explosion",
  },
  {
    type: "infinity",
    name: "Infinity",
    price: 2500,
    icon: Infinity,
    color: "from-cyan-400 to-purple-600",
    description: "Infinity symbol animation",
  },
  {
    type: "royalty",
    name: "Royalty",
    price: 5000,
    icon: Crown,
    color: "from-yellow-400 to-pink-600",
    description: "Crown + confetti",
  },
  {
    type: "godmode",
    name: "God Mode",
    price: 10000,
    icon: Gem,
    color: "from-pink-500 via-purple-500 to-cyan-400",
    description: "Epic legendary effect",
  },
];

interface SparkVaultProps {
  receiverId: string;
  videoId?: string;
  onSparkSent?: () => void;
}

export function SparkVault({ receiverId, videoId, onSparkSent }: SparkVaultProps) {
  const [selectedSpark, setSelectedSpark] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: user } = useQuery<{ coins: number }>({
    queryKey: ["/api/auth/user"],
  });

  const sendSparkMutation = useMutation({
    mutationFn: async (sparkType: string) => {
      return await apiRequest("/api/sparks", "POST", {
        receiverId,
        videoId,
        sparkType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sparks"] });
      toast({
        title: "Spark Sent!",
        description: `Your ${selectedSpark} spark was sent successfully.`,
      });
      setSelectedSpark(null);
      onSparkSent?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send spark",
        description: error.message || "Insufficient coins. Purchase more at /coins",
        variant: "destructive",
      });
    },
  });

  const handleSendSpark = (sparkType: string, price: number) => {
    if (!user || user.coins < price) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${price} coins to send this spark. Purchase more at /coins`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSpark(sparkType);
    sendSparkMutation.mutate(sparkType);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Spark Vault
          </h2>
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            {user?.coins || 0} coins
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Send Sparks to show appreciation. Creators earn 60% of the value! (Better than TikTok's 50%)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPARK_TYPES.map((spark, index) => {
          const Icon = spark.icon;
          const canAfford = user && user.coins >= spark.price;

          return (
            <motion.div
              key={spark.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover-elevate ${!canAfford ? "opacity-60" : ""}`}>
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${spark.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {spark.price}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{spark.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {spark.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!canAfford || sendSparkMutation.isPending}
                    onClick={() => handleSendSpark(spark.type, spark.price)}
                    data-testid={`button-send-spark-${spark.type}`}
                  >
                    {sendSparkMutation.isPending && selectedSpark === spark.type
                      ? "Sending..."
                      : `Send ${spark.name}`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-pink-500 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Better Value Than TikTok!</p>
            <p className="text-xs text-muted-foreground">
              Our Sparks are competitively priced and creators keep 75% of the value. 
              That's better than most platforms! 1 credit ≈ $0.024 USD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
