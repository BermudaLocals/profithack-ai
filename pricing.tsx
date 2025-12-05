import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, Gift, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const tiers = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      popular: false,
      description: "Perfect for getting started",
      features: [
        "Unlimited video watching",
        "Follow creators & like videos",
        "Send messages (up to 50/day)",
        "Daily Nexus streak rewards (50 credits/day)",
        "Basic video uploads (10 videos/month)",
        "Search & explore content",
        "TikTok-style feed (FYP, Reels, Tube)",
        "Community features",
      ],
      cta: "Start Free",
      href: "/signup",
      gradient: "from-gray-500 to-gray-700",
    },
    {
      name: "Creator Starter",
      price: { monthly: 9, annual: 86 },
      popular: false,
      description: "For aspiring content creators",
      features: [
        "Everything in Free +",
        "100 video uploads/month",
        "Basic analytics dashboard",
        "1GB cloud storage",
        "Priority video processing",
        "Remove watermarks",
        "Standard support",
        "500 bonus credits on signup",
      ],
      cta: "Start Creating",
      href: "/checkout?tier=starter",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      name: "Creator Pro",
      price: { monthly: 29, annual: 278 },
      popular: true,
      description: "For professional creators",
      features: [
        "Everything in Starter +",
        "Unlimited video uploads",
        "Advanced analytics & insights",
        "AI Video Generator (10 videos/month)",
        "10GB cloud storage",
        "Multi-platform posting (3 platforms)",
        "Priority support",
        "Battle Rooms early access",
        "2,000 bonus credits on signup",
        "Monthly credit packs (500 credits/month)",
      ],
      cta: "Go Pro",
      href: "/checkout?tier=pro",
      gradient: "from-pink-500 to-purple-600",
    },
    {
      name: "Creator Elite",
      price: { monthly: 99, annual: 950 },
      popular: false,
      description: "For top-tier creators & agencies",
      features: [
        "Everything in Pro +",
        "AI Video Generator (Unlimited)",
        "100GB cloud storage",
        "26 AI Expert Mentors access",
        "Multi-platform posting (All 5 platforms)",
        "Premium username marketplace access",
        "Battle Room priority seats",
        "White-glove support (24/7)",
        "Custom branding options",
        "10,000 bonus credits on signup",
        "Monthly credit packs (3,000 credits/month)",
        "Revenue share program (up to 70%)",
      ],
      cta: "Join Elite",
      href: "/checkout?tier=elite",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const discountAmount = billingPeriod === "annual" ? 20 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            LAUNCH SPECIAL: 50% OFF First Month!
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Choose Your Path to Success
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when ready. Join thousands of creators earning life-changing income.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
            className="relative"
            data-testid="button-billing-toggle"
          >
            <div className={`w-12 h-6 rounded-full transition-colors ${billingPeriod === "annual" ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${billingPeriod === "annual" ? "translate-x-6" : "translate-x-0.5"} mt-0.5`} />
            </div>
          </Button>
          <span className={billingPeriod === "annual" ? "font-semibold" : "text-muted-foreground"}>
            Annual
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => {
            const price = billingPeriod === "annual" ? tier.price.annual : tier.price.monthly;
            const monthlyPrice = billingPeriod === "annual" ? (tier.price.annual / 12).toFixed(0) : tier.price.monthly;
            const isLaunchDiscount = price > 0;
            const finalPrice = isLaunchDiscount ? price * 0.5 : price;

            return (
              <Card 
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary border-2 shadow-lg" : ""}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      {isLaunchDiscount && (
                        <span className="text-2xl text-muted-foreground line-through">
                          ${monthlyPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold">
                        ${billingPeriod === "annual" && price > 0 ? monthlyPrice : finalPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingPeriod === "annual" && price > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed ${finalPrice}/year
                      </p>
                    )}
                    {isLaunchDiscount && (
                      <Badge variant="secondary" className="mt-2">
                        <Gift className="w-3 h-3 mr-1" />
                        50% OFF Launch Special
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={tier.href} className="w-full">
                    <Button 
                      className={`w-full bg-gradient-to-r ${tier.gradient}`}
                      data-testid={`button-cta-${tier.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Credit Giveaway System */}
        <Card className="mb-16 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Gift className="w-8 h-8 text-pink-500" />
              Free Credits & Giveaways
            </CardTitle>
            <CardDescription className="text-lg">
              Earn credits daily, just like PokerGaga! Multiple ways to get free premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Daily Nexus Streak
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Login daily: <strong>50 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>7-day streak: <strong>500 bonus credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>30-day streak: <strong>3,000 bonus credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Miss a day = Streak resets (like PokerGaga!)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-cyan-500" />
                  Referral Rewards
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Invite friends: <strong>200 credits each</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>They get: <strong>200 credits too!</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Friend upgrades to paid: <strong>1,000 credits bonus</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>No limit on referrals!</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Creator Rewards
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Upload video: <strong>25 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Get 1,000 views: <strong>100 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Get 100 likes: <strong>50 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Viral video (100K+ views): <strong>5,000 credits</strong></span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Special Events
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Weekend spin wheel: <strong>100-10,000 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Holiday giveaways: <strong>Up to 50,000 credits</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Battle Room winners: <strong>Prize pools</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Random acts of kindness from us 💝</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h4 className="font-semibold mb-2">💰 What Can Credits Do?</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Send Virtual Gifts:</p>
                  <p className="text-muted-foreground">10-1,000 credits per gift</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Boost Your Videos:</p>
                  <p className="text-muted-foreground">100 credits = 1,000 guaranteed views</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Battle Room Entry:</p>
                  <p className="text-muted-foreground">50-500 credits per battle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Can I really start for free?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! All social features, messaging, video watching, and basic uploads are 100% free forever.
                  Upgrade only when you want premium creator tools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's the difference between credits and subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <strong>Credits</strong> are for sending gifts, boosting videos, and Battle Rooms. Earn them free daily!
                  <strong> Subscriptions</strong> unlock creator tools like AI video generator, analytics, and storage.
                  You can use the platform 100% free with just credits!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! Cancel anytime. You'll keep your premium features until the end of your billing period.
                  Your earned credits stay in your account forever.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How does the launch discount work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Launch special: <strong>50% OFF your first month</strong> on any paid tier! Just like PokerGaga's welcome bonus.
                  Plus, first 1,000 users get <strong>lifetime 30% discount</strong>. Lock it in now!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
