import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, X, Star, MapPin, Sparkles, Video, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Match {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  avatarUrl: string;
  videoProfileUrl: string;
  interests: string[];
  compatibilityScore: number;
  xaiExplanation: string;
}

export default function Dating() {
  const { toast } = useToast();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/dating/matches"],
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ matchId, direction }: { matchId: number; direction: "like" | "pass" }) => {
      return apiRequest("/api/dating/swipe", {
        method: "POST",
        body: { matchId, direction }
      });
    },
    onSuccess: (data, variables) => {
      if (variables.direction === "like" && data.matched) {
        toast({
          title: "It's a Match! 💕",
          description: "You both liked each other! Start chatting now!",
        });
      }
      setCurrentMatchIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  });

  const handleSwipe = (direction: "like" | "pass") => {
    const currentMatch = matches[currentMatchIndex];
    if (!currentMatch) return;
    
    swipeMutation.mutate({ matchId: currentMatch.id, direction });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentMatchIndex];
  const remainingMatches = matches.length - currentMatchIndex;

  if (!currentMatch || remainingMatches === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <Card className="bg-white/5 border-white/10 max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No More Matches</h2>
            <p className="text-gray-400 mb-6">
              Come back later for fresh matches, or upgrade to Premium for unlimited swipes!
            </p>
            <Button 
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
              data-testid="button-get-premium"
            >
              <Star className="w-4 h-4 mr-2" />
              Get Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Love Connection
            </h1>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
            {remainingMatches} matches left
          </Badge>
        </div>
      </div>

      {/* Match Card */}
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full">
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            {/* Profile Image/Video */}
            <div className="relative h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              {currentMatch.videoProfileUrl ? (
                <video 
                  src={currentMatch.videoProfileUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={currentMatch.avatarUrl} 
                  alt={currentMatch.displayName}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Compatibility Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white border-0 text-lg px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {currentMatch.compatibilityScore}% Match
                </Badge>
              </div>

              {/* Video Indicator */}
              {currentMatch.videoProfileUrl && (
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-red-500 text-white border-0">
                    <Video className="w-3 h-3 mr-1" />
                    Video Profile
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Name and Info */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {currentMatch.displayName}, {currentMatch.age}
                </h2>
                <p className="text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {currentMatch.location}
                </p>
              </div>

              {/* Bio */}
              <p className="text-gray-300 text-sm">
                {currentMatch.bio}
              </p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {currentMatch.interests.map((interest, i) => (
                  <Badge 
                    key={i}
                    variant="outline"
                    className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* AI Explanation */}
              {showExplanation && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 mt-1" />
                    <p className="text-xs font-semibold text-cyan-400">AI COMPATIBILITY INSIGHTS</p>
                  </div>
                  <p className="text-sm text-gray-300">
                    {currentMatch.xaiExplanation}
                  </p>
                </div>
              )}

              {/* Why This Match Button */}
              <Button 
                onClick={() => setShowExplanation(!showExplanation)}
                variant="outline"
                className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                data-testid="button-show-explanation"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showExplanation ? "Hide" : "Why This Match?"}
              </Button>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => handleSwipe("pass")}
                  disabled={swipeMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 h-16"
                  data-testid="button-pass"
                >
                  <X className="w-8 h-8" />
                </Button>
                
                <Button 
                  disabled={swipeMutation.isPending}
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 h-16 px-8"
                  data-testid="button-super-like"
                >
                  <Star className="w-6 h-6" />
                </Button>

                <Button 
                  onClick={() => handleSwipe("like")}
                  disabled={swipeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 h-16"
                  data-testid="button-like"
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline"
              className="flex-1 border-white/20 hover:bg-white/5"
              data-testid="button-send-message"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-white/20 hover:bg-white/5"
              data-testid="button-video-call"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
