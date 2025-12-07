import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { useComingSoon } from "@/hooks/useComingSoon";
import { COMING_SOON_FEATURES } from "@/config/features";
import { Sparkles, Rocket, Heart, Wallet, Video, Swords, Users, Crown } from "lucide-react";

export default function ComingSoonDemo() {
  const { isOpen, feature, showComingSoon, closeModal } = useComingSoon();

  const featureIcons = {
    aiVideoGenerator: Video,
    battleRooms: Swords,
    loveConnection: Heart,
    creatorWallet: Wallet,
    aiContentOrchestrator: Sparkles,
    premiumUsernames: Crown,
    expertMentors: Users,
    liveStreaming: Rocket
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            🚀 Coming Soon Features
          </h1>
          <p className="text-muted-foreground">
            Click any feature to learn more. Your clicks help us prioritize what matters most!
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(COMING_SOON_FEATURES).map(([key, feat]) => {
            const Icon = featureIcons[key as keyof typeof featureIcons] || Sparkles;
            return (
              <Card
                key={key}
                className="hover-elevate active-elevate-2 cursor-pointer border-primary/20"
                onClick={() => showComingSoon(key as any)}
                data-testid={`card-feature-${key}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{feat.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {feat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {feat.launchDate}
                    </span>
                    <Button size="sm" variant="ghost" className="text-primary">
                      Learn More →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Integration Example */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>💡 How to Use in Your Pages</CardTitle>
            <CardDescription>
              Add "Coming Soon" functionality to any button or feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`import { useComingSoon } from "@/hooks/useComingSoon";
import { ComingSoonModal } from "@/components/ComingSoonModal";

function MyPage() {
  const { isOpen, feature, showComingSoon, closeModal } = useComingSoon();

  return (
    <>
      <Button onClick={() => showComingSoon("battleRooms")}>
        Battle Rooms (Coming Soon)
      </Button>

      {feature && (
        <ComingSoonModal 
          isOpen={isOpen}
          onClose={closeModal}
          feature={feature}
        />
      )}
    </>
  );
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {feature && (
        <ComingSoonModal 
          isOpen={isOpen}
          onClose={closeModal}
          feature={feature}
        />
      )}
    </div>
  );
}
