import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Star, Zap, Crown, MapPin, Sparkles, MessageCircle, Shield, Eye, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface DatingProfile {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  avatarUrl: string;
  photos: string[];
  interests: string[];
  compatibilityScore: number;
  xaiExplanation: string;
  isVerified: boolean;
  isOnline: boolean;
  distance?: string;
  isPremium?: boolean;
}

export default function AIDating() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);
  const [superLikesLeft, setSuperLikesLeft] = useState(5);
  const [boostsLeft, setBoostsLeft] = useState(1);
  const [isPremium, setIsPremium] = useState(true);

  const { data: profiles = [], isLoading } = useQuery<DatingProfile[]>({
    queryKey: ["/api/dating/profiles"],
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ profileId, direction, superLike }: { profileId: number; direction: string; superLike?: boolean }) => {
      const res = await apiRequest("POST", "/api/dating/swipe", { matchId: profileId, direction, superLike });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.matched) {
        setMatchedProfile(profiles[currentIndex]);
        setShowMatch(true);
      }
      setCurrentIndex((prev) => prev + 1);
    },
  });

  const boostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/dating/boost", {});
      return res.json();
    },
    onSuccess: () => {
      setBoostsLeft((prev) => prev - 1);
      toast({ title: "Profile Boosted!", description: "You're now visible to 10x more people for 30 minutes!" });
    },
  });

  const handleSwipe = (direction: "left" | "right", superLike = false) => {
    if (currentIndex >= profiles.length) return;
    
    setSwipeDirection(direction);
    
    if (superLike && superLikesLeft > 0) {
      setSuperLikesLeft((prev) => prev - 1);
    }
    
    setTimeout(() => {
      swipeMutation.mutate({
        profileId: profiles[currentIndex].id,
        direction: direction === "right" ? "like" : "pass",
        superLike,
      });
      setSwipeDirection(null);
    }, 300);
  };

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-900/20 via-black to-purple-900/20 flex items-center justify-center">
        <div className="animate-pulse text-pink-400 text-xl">Finding your matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-900/20 via-black to-purple-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-pink-500/20 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/feed")} data-testid="button-back">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI Love
            </span>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black">
                <Crown className="w-3 h-3 mr-1" /> GOLD
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} data-testid="button-messages">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Premium Banner */}
      {isPremium && (
        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b border-amber-500/30 p-2">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4" /> {superLikesLeft} Super Likes
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Zap className="w-4 h-4" /> {boostsLeft} Boosts
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <Eye className="w-4 h-4" /> See Who Likes You
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4">
        {currentProfile ? (
          <div className="relative">
            {/* Profile Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: swipeDirection === "left" ? -300 : swipeDirection === "right" ? 300 : 0,
                  rotate: swipeDirection === "left" ? -20 : swipeDirection === "right" ? 20 : 0,
                }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Card className="overflow-hidden bg-gradient-to-b from-gray-900 to-black border-pink-500/20">
                  {/* Main Photo */}
                  <div className="relative aspect-[3/4]">
                    <img
                      src={currentProfile.avatarUrl}
                      alt={currentProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {currentProfile.isVerified && (
                        <Badge className="bg-blue-500/80 backdrop-blur">
                          <Shield className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                      {currentProfile.isOnline && (
                        <Badge className="bg-green-500/80 backdrop-blur">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" /> Online
                        </Badge>
                      )}
                      {currentProfile.isPremium && (
                        <Badge className="bg-amber-500/80 backdrop-blur">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>

                    {/* AI Compatibility Score */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3 shadow-lg shadow-pink-500/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{currentProfile.compatibilityScore}%</div>
                          <div className="text-xs text-pink-100">Match</div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {currentProfile.displayName}, {currentProfile.age}
                        {currentProfile.isVerified && <Shield className="w-5 h-5 text-blue-400" />}
                      </h2>
                      <p className="text-gray-300 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" /> {currentProfile.location}
                        {currentProfile.distance && <span className="text-pink-400 ml-2">{currentProfile.distance} away</span>}
                      </p>
                      <p className="text-gray-400 mt-2 line-clamp-2">{currentProfile.bio}</p>
                      
                      {/* Interests */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentProfile.interests.slice(0, 4).map((interest) => (
                          <Badge key={interest} variant="secondary" className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-t border-pink-500/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-300">AI Match Insight</p>
                        <p className="text-sm text-gray-400 mt-1">{currentProfile.xaiExplanation}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-2 border-red-500/50 hover:bg-red-500/20 hover:border-red-500"
                onClick={() => handleSwipe("left")}
                data-testid="button-pass"
              >
                <X className="w-8 h-8 text-red-400" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-14 h-14 rounded-full border-2 border-blue-500/50 hover:bg-blue-500/20 hover:border-blue-500"
                onClick={() => handleSwipe("right", true)}
                disabled={superLikesLeft === 0}
                data-testid="button-superlike"
              >
                <Star className="w-6 h-6 text-blue-400" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-2 border-green-500/50 hover:bg-green-500/20 hover:border-green-500"
                onClick={() => handleSwipe("right")}
                data-testid="button-like"
              >
                <Heart className="w-8 h-8 text-green-400" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-14 h-14 rounded-full border-2 border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-500"
                onClick={() => boostMutation.mutate()}
                disabled={boostsLeft === 0}
                data-testid="button-boost"
              >
                <Zap className="w-6 h-6 text-purple-400" />
              </Button>
            </div>

            {/* Stats */}
            <div className="text-center mt-4 text-gray-500 text-sm">
              {currentIndex + 1} of {profiles.length} profiles
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-pink-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No more profiles</h3>
            <p className="text-gray-400 mb-6">Check back later for more matches!</p>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-purple-500"
              onClick={() => setCurrentIndex(0)}
            >
              Start Over
            </Button>
          </div>
        )}

        {/* Premium Upgrade Banner */}
        {!isPremium && (
          <Card className="mt-6 p-4 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-amber-500/30">
            <div className="flex items-center gap-4">
              <Crown className="w-12 h-12 text-amber-400" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-300">Upgrade to Gold</h3>
                <p className="text-sm text-gray-400">Unlimited likes, see who likes you, 5 super likes daily</p>
              </div>
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold">
                $29.99/mo
              </Button>
            </div>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/20 hover-elevate cursor-pointer">
            <Eye className="w-8 h-8 text-pink-400 mb-2" />
            <h4 className="font-bold text-white">Who Likes You</h4>
            <p className="text-sm text-gray-400">12 people</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/20 hover-elevate cursor-pointer">
            <Flame className="w-8 h-8 text-orange-400 mb-2" />
            <h4 className="font-bold text-white">Top Picks</h4>
            <p className="text-sm text-gray-400">Daily curated</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/20 hover-elevate cursor-pointer">
            <MessageCircle className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-bold text-white">Messages</h4>
            <p className="text-sm text-gray-400">3 new</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/20 hover-elevate cursor-pointer">
            <Heart className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="font-bold text-white">Matches</h4>
            <p className="text-sm text-gray-400">8 matches</p>
          </Card>
        </div>
      </main>

      {/* Match Modal */}
      <Dialog open={showMatch} onOpenChange={setShowMatch}>
        <DialogContent className="bg-gradient-to-b from-pink-900 to-purple-900 border-pink-500/50 text-center">
          <div className="py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              💕
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">It's a Match!</h2>
            <p className="text-pink-200 mb-6">You and {matchedProfile?.displayName} liked each other</p>
            
            <div className="flex justify-center gap-4 mb-6">
              <Avatar className="w-24 h-24 border-4 border-pink-500">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <Avatar className="w-24 h-24 border-4 border-purple-500">
                <AvatarImage src={matchedProfile?.avatarUrl} />
                <AvatarFallback>{matchedProfile?.displayName?.[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-pink-500/50"
                onClick={() => setShowMatch(false)}
              >
                Keep Swiping
              </Button>
              <Button 
                className="bg-gradient-to-r from-pink-500 to-purple-500"
                onClick={() => {
                  setShowMatch(false);
                  navigate("/messages");
                }}
              >
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-pink-500/20 p-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate("/feed")} data-testid="nav-feed">
            <Flame className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Feed</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2 text-pink-400" data-testid="nav-dating">
            <Heart className="w-6 h-6" />
            <span className="text-xs">Dating</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate("/messages")} data-testid="nav-messages">
            <MessageCircle className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Chat</span>
          </Button>
          <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate("/wallet")} data-testid="nav-wallet">
            <Crown className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Premium</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
