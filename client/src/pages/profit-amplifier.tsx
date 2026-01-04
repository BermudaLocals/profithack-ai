import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Shield, HeadphonesIcon, TrendingUpIcon } from 'lucide-react';

export default function ProfitAmplifierPage() {
  const queryClient = useQueryClient();
  // In a real app, you'd fetch the user's current tier from the API
  const userTier = 'free'; // Placeholder

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">The AI Profit Amplifier</h1>
        <p className="text-xl text-muted-foreground">
          Stop guessing. Start growing. We provide the AI, strategy, and tools to turn your business into an automated revenue machine.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Premium Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Premium
              <Badge variant="secondary">Most Popular</Badge>
            </CardTitle>
            <CardDescription>
              For creators and entrepreneurs ready to 10x their output.
            </CardDescription>
            <div className="text-4xl font-bold">
              $19.99 <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <FeatureItem text="Unlimited AI Ad Script Generation" />
              <FeatureItem text="Full Access to 'Learn-to-Earn' Academy" />
              <FeatureItem text="1,000 Daily Credits" />
              <FeatureItem text="Priority AI Support" />
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Get Started with Premium
            </Button>
          </CardFooter>
        </Card>

        {/* Business Plan */}
        <Card className="relative border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Business
              <Badge variant="default">For Professionals</Badge>
            </CardTitle>
            <CardDescription>
              The complete "Done-With-You" system for serious scale.
            </CardDescription>
            <div className="text-4xl font-bold">
              $2,000 <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <FeatureItem text="Everything in Premium" />
              <FeatureItem text="Dedicated AI 'Co-Pilot' Business Strategist" />
              <FeatureItem text="Unlimited Credits & Priority Processing" />
              <FeatureItem text="Custom AI Model Fine-Tuning" />
              <FeatureItem text="Monthly Strategy & Growth Call" />
              <FeatureItem text="White-Glove Onboarding & Support" />
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="default">
              Book a Call for Business Plan
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold">What You Get With The Business Plan</h2>
        <p className="text-lg text-muted-foreground">
          We don't just give you tools; we integrate into your business and drive results.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <BenefitCard icon={<Zap className="h-8 w-8" />} title="Light Fast AI" description="Our proprietary routing system uses the fastest models available, giving you instant insights." />
          <BenefitCard icon={<Shield className="h-8 w-8" />} title="Brand Voice DNA" description="We define your unique brand voice once and apply it to all AI-generated content for perfect consistency." />
          <BenefitCard icon={<HeadphonesIcon className="h-8 w-8" />} title="Expert Support" description="Get direct access to our team of AI strategists to ensure you're getting maximum value." />
        </div>
      </section>
    </div>
  );
}

// Helper components for cleaner code
function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center">
      <Check className="mr-2 h-4 w-4 text-green-500" />
      {text}
    </li>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center">{icon}</div>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
