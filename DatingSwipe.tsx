/**
 * PROFITHACK AI - Dating/Love Connection Swipe Interface
 * 
 * Features:
 * - Tinder-style swipe cards
 * - AI compatibility scoring with explanations
 * - Video-first profiles (Sora 2 ready)
 * - XAI recommendation reasons
 * - Both-sided payment unlock system
 * - Freemium model (5 free swipes/day)
 * - 100x better matching than dating apps
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Heart,
  X,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Info,
  Video,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface DatingProfile {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  location: string;
  occupation: string;
  education: string;
  photos: string[];
  videoProfileUrl?: string;
  interests: string[];
  aiCompatibility: {
    score: number;
    matchReasons: string[];
    confidence: number;
    factors: {
      interestMatch: number;
      locationScore: number;
      ageCompatibility: number;
      activityPatternMatch: number;
      aiPersonalityMatch: number;
    };
  };
}

export default function DatingSwipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [matchDialog, setMatchDialog] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);
  const [swipesRemaining, setSwipesRemaining] = useState(5); // Free tier
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  // Fetch potential matches
  const { data: profiles = [], isLoading } = useQuery<DatingProfile[]>({
    queryKey: ['/api/dating/matches'],
    queryFn: async () => {
      // Simulate API call with mock data
      return [
        {
          id: 'user1',
          displayName: 'Sarah Chen',
          age: 26,
          bio: 'Tech founder, AI enthusiast, love traveling and building cool stuff 🚀',
          location: 'San Francisco, CA',
          occupation: 'Software Engineer at TechCorp',
          education: 'Stanford University',
          photos: ['/placeholder-avatar.jpg'],
          videoProfileUrl: '/videos/profile1.mp4',
          interests: ['tech', 'travel', 'startup', 'ai', 'fitness'],
          aiCompatibility: {
            score: 87,
            matchReasons: [
              '🎯 85% shared interests (tech, AI, startup)',
              '📍 Only 3 km away from you',
              '🎂 Perfect age match (24-29)',
              '✨ AI predicts great chemistry (82% compatibility)',
            ],
            confidence: 0.92,
            factors: {
              interestMatch: 0.85,
              locationScore: 0.95,
              ageCompatibility: 1.0,
              activityPatternMatch: 0.78,
              aiPersonalityMatch: 0.82,
            },
          },
        },
        {
          id: 'user2',
          displayName: 'Alex Rivera',
          age: 28,
          bio: 'Designer by day, musician by night. Love art, coffee, and meaningful conversations ☕',
          location: 'San Francisco, CA',
          occupation: 'UX Designer at Creative Studio',
          education: 'Rhode Island School of Design',
          photos: ['/placeholder-avatar.jpg'],
          interests: ['design', 'music', 'art', 'coffee', 'photography'],
          aiCompatibility: {
            score: 72,
            matchReasons: [
              '🎨 Shared creative interests',
              '📍 Located in same city',
              '⏰ Similar activity patterns (active evenings)',
              '🎵 Both interested in music and arts',
            ],
            confidence: 0.78,
            factors: {
              interestMatch: 0.65,
              locationScore: 0.90,
              ageCompatibility: 0.85,
              activityPatternMatch: 0.82,
              aiPersonalityMatch: 0.70,
            },
          },
        },
      ];
    },
  });

  // Record swipe
  const swipeMutation = useMutation({
    mutationFn: async ({ profileId, action }: { profileId: string; action: 'like' | 'pass' | 'super_like' }) => {
      return apiRequest('/api/dating/swipe', 'POST', { profileId, action });
    },
    onSuccess: (data, variables) => {
      if (data.matched) {
        setMatchedProfile(profiles[currentIndex]);
        setMatchDialog(true);
      }
      
      setCurrentIndex(currentIndex + 1);
      setSwipesRemaining(swipesRemaining - 1);
      
      toast({
        title: variables.action === 'like' ? '💚 Liked!' : variables.action === 'super_like' ? '⭐ Super Liked!' : '👋 Passed',
        description: data.matched ? 'It\'s a match! 🎉' : 'Looking for more matches...',
      });
    },
  });

  const handleSwipe = (action: 'like' | 'pass' | 'super_like') => {
    if (swipesRemaining <= 0) {
      toast({
        title: '😔 Out of free swipes!',
        description: 'Upgrade to premium for unlimited swipes (10 coins each)',
        variant: 'destructive',
      });
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      swipeMutation.mutate({ profileId: currentProfile.id, action });
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const offset = dragOffset.x;
    
    if (Math.abs(offset) > 100) {
      if (offset > 0) {
        handleSwipe('like');
      } else {
        handleSwipe('pass');
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 p-8">
          <Heart className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">No more profiles for now</h2>
          <p className="text-muted-foreground">Check back later for new matches!</p>
          <Button>Adjust Filters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-background dark:via-background dark:to-background p-4">
      <div className="max-w-md mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Love Connection
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-Powered Matching • {swipesRemaining} swipes left today
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Premium
          </Badge>
        </div>

        {/* Swipe Card */}
        <div className="relative h-[600px]" data-testid="dating-swipe-container">
          <Card
            ref={cardRef}
            className={cn(
              'absolute inset-0 overflow-hidden transition-transform cursor-grab active:cursor-grabbing',
              dragOffset.x !== 0 && 'transition-none'
            )}
            style={{
              transform: `translateX(${dragOffset.x}px) rotate(${dragOffset.x / 20}deg)`,
            }}
            data-testid="swipe-card"
          >
            <CardContent className="p-0 h-full flex flex-col">
              {/* Profile Image/Video */}
              <div className="relative h-2/3 bg-gradient-to-br from-pink-200 to-purple-200">
                {currentProfile.videoProfileUrl ? (
                  <video
                    src={currentProfile.videoProfileUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    data-testid="profile-video"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar className="w-64 h-64">
                      <AvatarImage src={currentProfile.photos[0]} />
                      <AvatarFallback className="text-6xl">
                        {currentProfile.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* AI Compatibility Badge */}
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm"
                    onClick={() => setShowCompatibility(!showCompatibility)}
                    data-testid="button-compatibility"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {currentProfile.aiCompatibility.score}% Match
                  </Button>
                </div>

                {/* Video Profile Indicator */}
                {currentProfile.videoProfileUrl && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-black/50 backdrop-blur-sm">
                      <Video className="w-3 h-3 mr-1" />
                      Video Profile
                    </Badge>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{currentProfile.displayName}</h2>
                    <span className="text-xl text-muted-foreground">{currentProfile.age}</span>
                  </div>
                  <p className="text-muted-foreground">{currentProfile.bio}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{currentProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{currentProfile.occupation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>{currentProfile.education}</span>
                  </div>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>

                {/* XAI Compatibility Breakdown */}
                {showCompatibility && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Why you're a great match</span>
                    </div>

                    <div className="space-y-2">
                      {currentProfile.aiCompatibility.matchReasons.map((reason, i) => (
                        <p key={i} className="text-sm">{reason}</p>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Interest Match</span>
                        <span>{Math.round(currentProfile.aiCompatibility.factors.interestMatch * 100)}%</span>
                      </div>
                      <Progress value={currentProfile.aiCompatibility.factors.interestMatch * 100} />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Location Proximity</span>
                        <span>{Math.round(currentProfile.aiCompatibility.factors.locationScore * 100)}%</span>
                      </div>
                      <Progress value={currentProfile.aiCompatibility.factors.locationScore * 100} />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>AI Personality Match</span>
                        <span>{Math.round(currentProfile.aiCompatibility.factors.aiPersonalityMatch * 100)}%</span>
                      </div>
                      <Progress value={currentProfile.aiCompatibility.factors.aiPersonalityMatch * 100} />
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Confidence: {Math.round(currentProfile.aiCompatibility.confidence * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Swipe Indicators */}
          {dragOffset.x > 50 && (
            <div className="absolute top-20 right-20 text-green-500 text-6xl font-bold rotate-12 opacity-50">
              LIKE
            </div>
          )}
          {dragOffset.x < -50 && (
            <div className="absolute top-20 left-20 text-red-500 text-6xl font-bold -rotate-12 opacity-50">
              NOPE
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            size="icon"
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => handleSwipe('pass')}
            data-testid="button-pass"
          >
            <X className="w-8 h-8 text-red-500" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-20 w-20 rounded-full border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
            onClick={() => handleSwipe('super_like')}
            data-testid="button-super-like"
          >
            <Star className="w-10 h-10 text-purple-500 fill-purple-500" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => handleSwipe('like')}
            data-testid="button-like"
          >
            <Heart className="w-8 h-8 text-green-500" />
          </Button>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Free: 5 swipes/day • Premium: Unlimited swipes (10 coins each)</p>
          <p>Match unlock: 50 credits + 25 coins (both users)</p>
        </div>
      </div>

      {/* Match Dialog */}
      <Dialog open={matchDialog} onOpenChange={setMatchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 It's a Match!</DialogTitle>
            <DialogDescription className="text-center">
              You and {matchedProfile?.displayName} liked each other
            </DialogDescription>
          </DialogHeader>

          {matchedProfile && (
            <div className="flex justify-center gap-4 py-6">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={matchedProfile.photos[0]} />
                <AvatarFallback>{matchedProfile.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
              </div>
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src="/your-avatar.jpg" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            </div>
          )}

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full gap-2" data-testid="button-send-message">
              <MessageCircle className="w-4 h-4" />
              Send Message (50 credits + 25 coins)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setMatchDialog(false)}>
              Keep Swiping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
