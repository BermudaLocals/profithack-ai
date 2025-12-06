import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BattleChallenge {
  id: string;
  challengerId: string;
  challengedId: string;
  title: string;
  message: string | null;
  battleType: string;
  teamCount: number;
  teamSize: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  challenger?: {
    username: string;
    displayName: string;
  };
}

export function BattleChallengesList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery<BattleChallenge[]>({
    queryKey: ["/api/battles/challenges/pending"],
    refetchInterval: 30000, // Poll every 30 seconds for new challenges
  });

  const acceptMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest("POST", `/api/battles/challenge/${challengeId}/accept`, {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Challenge accepted!",
        description: "Entering battle room...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/challenges/pending"] });
      navigate(`/battle/${data.battleRoom.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest("POST", `/api/battles/challenge/${challengeId}/decline`, {});
    },
    onSuccess: () => {
      toast({
        title: "Challenge declined",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/battles/challenges/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to decline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Battle Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Battle Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pending challenges. Challenge someone to battle!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Battle Challenges
          <Badge variant="destructive" className="ml-auto">
            {challenges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id} data-testid={`challenge-${challenge.id}`} className="border-pink-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {challenge.challenger?.username?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">
                          {challenge.challenger?.displayName || "Unknown"}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {challenge.battleType === "solo" ? "1v1" : `${challenge.teamSize}v${challenge.teamSize}`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        @{challenge.challenger?.username || "unknown"}
                      </p>
                      <p className="font-medium text-pink-500 mb-2">
                        {challenge.title}
                      </p>
                      {challenge.message && (
                        <p className="text-sm text-muted-foreground mb-3">
                          "{challenge.message}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Clock className="w-3 h-3" />
                        Expires: {new Date(challenge.expiresAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          data-testid={`button-accept-${challenge.id}`}
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => acceptMutation.mutate(challenge.id)}
                          disabled={acceptMutation.isPending}
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          data-testid={`button-decline-${challenge.id}`}
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => declineMutation.mutate(challenge.id)}
                          disabled={declineMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
