/**
 * PROFITHACK AI - OnlyFans Expert Creators Showcase
 * Ultra-Realistic Business Masters with proven $85K+/month revenue
 * Now with WORKING subscription system for models to get subscribers!
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, TrendingUp, Users, DollarSign, Target, Sparkles, Crown, Award, Heart, Lock, Unlock, CreditCard, CheckCircle } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnlyFansExpert {
  id: string;
  name: string;
  handle: string;
  ethnicity: string | null;
  beautyProfile: any;
  businessProfile: any;
  onlyfansExpertise: any;
  contentStrategy: any;
  marketingStrategy: any;
  advancedKnowledge: any;
  performanceMetrics: any;
  bio: string;
  personality: string;
  uniqueValueProposition: string;
  targetAudience: string;
  brandStory: string;
  isActive: boolean;
}

export default function OnlyFansPage() {
  const [selectedExpert, setSelectedExpert] = useState<OnlyFansExpert | null>(null);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [subscribedExperts, setSubscribedExperts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: expertsData, isLoading } = useQuery<{ success: boolean; experts: OnlyFansExpert[] }>({
    queryKey: ["/api/onlyfans/experts"],
  });

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ expertId, tierId, price }: { expertId: string; tierId: string; price: number }) => {
      const response = await apiRequest("POST", "/api/onlyfans/subscribe", {
        expertId,
        tierId,
        price
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setSubscribedExperts(prev => new Set([...prev, variables.expertId]));
      toast({
        title: "Subscribed!",
        description: `You're now subscribed to ${selectedExpert?.name}. Enjoy exclusive content!`,
      });
      setSubscribeModalOpen(false);
      setSelectedTier(null);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again or check your payment method.",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = (expert: OnlyFansExpert, tier: any) => {
    setSelectedExpert(expert);
    setSelectedTier(tier);
    setSubscribeModalOpen(true);
  };

  const confirmSubscription = () => {
    if (!selectedExpert || !selectedTier) return;
    subscribeMutation.mutate({
      expertId: selectedExpert.id,
      tierId: selectedTier.name.toLowerCase(),
      price: selectedTier.price
    });
  };

  const experts = expertsData?.experts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00F2EA] mx-auto mb-4" />
          <p className="text-white text-lg">Loading expert creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ELITE2026 Deployment Banner */}
        <Card className="mb-8 bg-gradient-to-r from-cyan-900/30 via-purple-900/30 to-pink-900/30 border-cyan-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">ELITE2026 Deployment Hub</h3>
                  <p className="text-gray-300">
                    Deploy 6 elite creators to OnlyFans + 4 platforms • $518K/month revenue target • 30-minute setup
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = '/elite2026'}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6"
                data-testid="button-go-to-elite2026"
              >
                <Target className="w-4 h-4 mr-2" />
                Setup & Deploy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-10 w-10 text-[#FF00FF]" />
            <h1
              className="text-5xl font-bold bg-gradient-to-r from-[#00F2EA] via-[#FF00FF] to-[#FF4500] bg-clip-text text-transparent"
              data-testid="heading-onlyfans-experts"
            >
              OnlyFans Expert Creators
            </h1>
            <Crown className="h-10 w-10 text-[#00F2EA]" />
          </div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Ultra-realistic AI business masters with proven track records. Each expert earns $85K-$92K/month and
            brings decades of experience in content monetization, subscriber psychology, and revenue optimization.
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-[#00F2EA] to-[#FF00FF] text-white border-0 px-4 py-2 text-base">
            <TrendingUp className="h-4 w-4 mr-2" />
            Combined Revenue: $177K/month
          </Badge>
        </div>

        {/* Expert Cards Grid */}
        {experts.length === 0 ? (
          <Card className="bg-black/50 border-[#00F2EA]/30">
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-[#FF00FF] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Experts Available</h3>
              <p className="text-gray-400 mb-6">
                Expert creators haven't been seeded yet. Click below to initialize the expert database.
              </p>
              <Button
                onClick={async () => {
                  const response = await fetch("/api/onlyfans/experts/seed", { method: "POST" });
                  const result = await response.json();
                  if (result.success) {
                    window.location.reload();
                  }
                }}
                className="bg-gradient-to-r from-[#00F2EA] to-[#FF00FF] hover:opacity-90 text-white"
                data-testid="button-seed-experts"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Seed Expert Creators
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experts.map((expert) => (
              <Card
                key={expert.id}
                className="bg-black/70 border-[#00F2EA]/30 hover:border-[#FF00FF]/50 transition-all cursor-pointer hover-elevate"
                onClick={() => setSelectedExpert(expert)}
                data-testid={`card-expert-${expert.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-white mb-1">{expert.name}</CardTitle>
                      <CardDescription className="text-[#00F2EA] font-mono">{expert.handle}</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#FF00FF] to-[#FF4500] text-white border-0">
                      ${expert.businessProfile.currentMonthlyRevenue.toLocaleString()}/mo
                    </Badge>
                  </div>
                  <p className="text-gray-300 mt-3 text-sm leading-relaxed">{expert.bio}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-[#00F2EA] mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">Subscribers</span>
                      </div>
                      <p className="text-white font-bold text-lg">
                        {expert.businessProfile.subscriberCount.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-[#FF00FF] mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">ROI</span>
                      </div>
                      <p className="text-white font-bold text-lg">{expert.performanceMetrics.contentRoi}%</p>
                    </div>

                    <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-[#FF4500] mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Lifetime</span>
                      </div>
                      <p className="text-white font-bold text-lg">
                        ${(expert.businessProfile.totalEarnings / 1000000).toFixed(1)}M
                      </p>
                    </div>

                    <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-[#00F2EA] mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-xs font-medium">Engagement</span>
                      </div>
                      <p className="text-white font-bold text-lg">{expert.performanceMetrics.customerSatisfaction}%</p>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-[#00F2EA]/30 text-[#00F2EA] text-xs">
                      {expert.businessProfile.yearsInBusiness} years exp
                    </Badge>
                    <Badge variant="outline" className="border-[#FF00FF]/30 text-[#FF00FF] text-xs">
                      {expert.onlyfansExpertise.subscriptionTiers.length} tiers
                    </Badge>
                    <Badge variant="outline" className="border-[#FF4500]/30 text-[#FF4500] text-xs">
                      {expert.performanceMetrics.subscriberGrowthRate}% growth
                    </Badge>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[#00F2EA] via-[#FF00FF] to-[#FF4500] hover:opacity-90 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExpert(expert);
                    }}
                    data-testid={`button-view-expert-${expert.id}`}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Expert Detail Modal/Sidebar */}
        {selectedExpert && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExpert(null)}
            data-testid="modal-expert-detail"
          >
            <Card
              className="bg-gradient-to-br from-black via-purple-950/30 to-black border-[#00F2EA]/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-[#00F2EA]/20">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-white mb-2">{selectedExpert.name}</CardTitle>
                    <CardDescription className="text-[#00F2EA] text-lg font-mono">
                      {selectedExpert.handle}
                    </CardDescription>
                    <p className="text-gray-300 mt-2">{selectedExpert.uniqueValueProposition}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedExpert(null)}
                    className="text-gray-400 hover:text-white"
                    data-testid="button-close-modal"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>

              <ScrollArea className="h-[calc(90vh-200px)]">
                <CardContent className="p-6 space-y-6">
                  {/* Business Profile */}
                  <div>
                    <h3 className="text-xl font-bold text-[#FF00FF] mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Business Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-purple-950/20 rounded-lg p-4 border border-purple-500/10">
                        <p className="text-gray-400 text-sm mb-1">Monthly Revenue</p>
                        <p className="text-white font-bold text-xl">
                          ${selectedExpert.businessProfile.currentMonthlyRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-950/20 rounded-lg p-4 border border-purple-500/10">
                        <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                        <p className="text-white font-bold text-xl">
                          ${(selectedExpert.businessProfile.totalEarnings / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div className="bg-purple-950/20 rounded-lg p-4 border border-purple-500/10">
                        <p className="text-gray-400 text-sm mb-1">Subscribers</p>
                        <p className="text-white font-bold text-xl">
                          {selectedExpert.businessProfile.subscriberCount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-950/20 rounded-lg p-4 border border-purple-500/10">
                        <p className="text-gray-400 text-sm mb-1">Content ROI</p>
                        <p className="text-white font-bold text-xl">{selectedExpert.performanceMetrics.contentRoi}%</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#00F2EA]/20" />

                  {/* Subscription Tiers with Subscribe Buttons */}
                  <div>
                    <h3 className="text-xl font-bold text-[#00F2EA] mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Subscribe to {selectedExpert.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedExpert.onlyfansExpertise.subscriptionTiers.map((tier: any, idx: number) => {
                        const isSubscribed = subscribedExperts.has(selectedExpert.id);
                        return (
                          <div
                            key={idx}
                            className={`bg-purple-950/20 rounded-lg p-4 border ${
                              idx === 1 ? 'border-[#FF00FF]/50 ring-2 ring-[#FF00FF]/30' : 'border-purple-500/10'
                            } relative`}
                            data-testid={`tier-${tier.name.toLowerCase()}`}
                          >
                            {idx === 1 && (
                              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF00FF] to-[#FF4500] text-white text-xs">
                                Most Popular
                              </Badge>
                            )}
                            <h4 className="text-white font-bold text-lg mb-1">{tier.name}</h4>
                            <p className="text-[#FF00FF] font-bold text-2xl mb-2">${tier.price}/mo</p>
                            <p className="text-gray-400 text-sm mb-3">{tier.exclusiveContent}</p>
                            <div className="text-xs text-gray-500 space-y-1 mb-4">
                              <p className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {tier.subscriberCount.toLocaleString()} subscribers
                              </p>
                              <p className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${tier.monthlyRevenue.toLocaleString()}/mo revenue
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe(selectedExpert, tier);
                              }}
                              disabled={isSubscribed}
                              className={`w-full ${
                                isSubscribed 
                                  ? 'bg-green-600 hover:bg-green-600' 
                                  : idx === 1 
                                    ? 'bg-gradient-to-r from-[#FF00FF] to-[#FF4500]' 
                                    : 'bg-gradient-to-r from-[#00F2EA] to-[#00D4FF]'
                              } text-white`}
                              data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                            >
                              {isSubscribed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Subscribed
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Subscribe ${tier.price}/mo
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-[#00F2EA]/20" />

                  {/* Brand Story */}
                  <div>
                    <h3 className="text-xl font-bold text-[#FF4500] mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Brand Story
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{selectedExpert.brandStory}</p>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Target Audience</h3>
                    <p className="text-gray-400">{selectedExpert.targetAudience}</p>
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        )}

        {/* Subscription Confirmation Modal */}
        <Dialog open={subscribeModalOpen} onOpenChange={setSubscribeModalOpen}>
          <DialogContent className="bg-black border-purple-500/50 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Heart className="h-6 w-6 text-[#FF00FF]" />
                Subscribe to {selectedExpert?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                You're about to subscribe to exclusive content from {selectedExpert?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedTier && (
              <div className="space-y-4 py-4">
                <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white">{selectedTier.name} Tier</span>
                    <Badge className="bg-gradient-to-r from-[#FF00FF] to-[#FF4500] text-white">
                      ${selectedTier.price}/mo
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{selectedTier.exclusiveContent}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instant access to all exclusive content
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Direct messaging with creator
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cancel anytime
                  </div>
                </div>

                <div className="border-t border-purple-500/20 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Total Today</span>
                    <span className="text-[#00F2EA]">${selectedTier.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Then ${selectedTier.price}/month. Cancel anytime.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSubscribeModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                data-testid="button-cancel-subscribe"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSubscription}
                disabled={subscribeMutation.isPending}
                className="bg-gradient-to-r from-[#FF00FF] to-[#FF4500] text-white"
                data-testid="button-confirm-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
