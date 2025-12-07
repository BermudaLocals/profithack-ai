import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, Users, TrendingUp, DollarSign, Gift, Award, Globe, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const donationFormSchema = z.object({
  amount: z.string().min(1, "Amount required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 1, "Minimum $1"),
  donorName: z.string().optional(),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
});

type DonationForm = z.infer<typeof donationFormSchema>;

export default function CharityPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: "",
      donorName: "",
      message: "",
      isAnonymous: false,
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/charity/stats"],
  });

  const donationMutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      return await apiRequest("/api/charity/donate", "POST", {
        amount: parseFloat(data.amount),
        donorName: data.donorName,
        message: data.message,
        isAnonymous: data.isAnonymous,
        donationType: "direct",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you! 💝",
        description: "Your donation helps families escape poverty and build better futures.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Donation failed",
        description: error.message || "Please try again",
      });
    },
  });

  const programs = [
    {
      icon: Users,
      title: "Family Support",
      description: "Help families escape poverty with education, housing, and basic needs",
      impact: "6 children + families",
      color: "text-pink-500",
    },
    {
      icon: TrendingUp,
      title: "Education Programs",
      description: "Scholarships, school supplies, tutoring for underprivileged children",
      impact: "100+ kids/year",
      color: "text-cyan-500",
    },
    {
      icon: DollarSign,
      title: "Creator Economy",
      description: "Train people to earn income online, breaking poverty cycles",
      impact: "50+ families",
      color: "text-purple-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Support communities worldwide, starting with Bermuda & beyond",
      impact: "10 countries",
      color: "text-orange-500",
    },
  ];

  const impactStats = [
    { label: "Total Raised", value: `$${(stats?.totalRaised || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Families Helped", value: stats?.familiesHelped || 0, icon: Users },
    { label: "Donors", value: stats?.totalDonors || 0, icon: Heart },
    { label: "Programs", value: 4, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white">
            <Heart className="w-3 h-3 mr-1" />
            PROFITHACK AI Foundation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Helping Families Escape Poverty
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Every dollar donated goes directly to families in need. 
            Together, we're breaking poverty cycles through education, opportunity, and hope.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8"
              onClick={() => setShowForm(true)}
              data-testid="button-donate-now"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20 text-lg px-8"
              data-testid="button-learn-more"
            >
              <Globe className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid md:grid-cols-4 gap-6">
          {impactStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-card border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-600/20">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Our Mission */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground">
              PROFITHACK AI was built by a father of 6 who knows what it's like to struggle.
              Now, we're using our platform to help others escape poverty and build better futures.
            </p>
          </div>

          <Card className="mb-12 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                How Your Donation Helps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {programs.map((program, idx) => {
                  const Icon = program.icon;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className={`p-3 rounded-lg bg-card h-fit ${program.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{program.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          Impact: {program.impact}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Donation Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                100% of your donation goes directly to families in need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => donationMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donation Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="25.00"
                            {...field}
                            data-testid="input-donation-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {[10, 25, 50, 100, 250, 500].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        onClick={() => form.setValue("amount", amount.toString())}
                        data-testid={`button-quick-${amount}`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-donor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Words of encouragement..."
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      {...form.register("isAnonymous")}
                      data-testid="checkbox-anonymous"
                    />
                    <label htmlFor="anonymous" className="text-sm">
                      Make this donation anonymous
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                      disabled={donationMutation.isPending}
                      data-testid="button-submit-donation"
                    >
                      {donationMutation.isPending ? "Processing..." : "Donate Now"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel-donation"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* How We're Funded */}
      <div className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Multiple Ways We Support Charity</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Gift className="w-10 h-10 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Direct Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    100% of direct donations go to charity programs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="w-10 h-10 text-cyan-500 mb-2" />
                  <CardTitle className="text-lg">Premium Usernames</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    10% of premium username sales donated to charity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="w-10 h-10 text-pink-500 mb-2" />
                  <CardTitle className="text-lg">Battle Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    5% of battle entry fees support education programs
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
