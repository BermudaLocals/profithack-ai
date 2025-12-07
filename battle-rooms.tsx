import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Swords, Trophy, Users, Flame, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Battle {
  id: number;
  creator1Id: number;
  creator2Id: number;
  creator1Username: string;
  creator2Username: string;
  creator1Avatar: string;
  creator2Avatar: string;
  creator1Video: string;
  creator2Video: string;
  creator1Votes: number;
  creator2Votes: number;
  prizePool: number;
  status: "active" | "ended";
  category: string;
  endsAt: string;
}

export default function BattleRooms() {
  const { toast } = useToast();
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);

  const { data: battles = [], isLoading } = useQuery<Battle[]>({
    queryKey: ["/api/battles"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ battleId, creatorNumber }: { battleId: number; creatorNumber: 1 | 2 }) => {
      return apiRequest(`/api/battles/${battleId}/vote`, {
        method: "POST",
        body: { creatorNumber }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
      toast({
        title: "Vote Cast! ⚡",
        description: "Your vote has been recorded in this epic battle!"
      });
    }
  });

  const createBattleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/battles/create", {
        method: "POST",
        body: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
      toast({
        title: "Battle Created! ⚔️",
        description: "Your battle is now live! Get ready to compete!"
      });
    }
  });

  const handleVote = (battleId: number, creatorNumber: 1 | 2) => {
    voteMutation.mutate({ battleId, creatorNumber });
  };

  const getTotalVotes = (battle: Battle) => battle.creator1Votes + battle.creator2Votes;
  const getVotePercentage = (votes: number, total: number) => 
    total === 0 ? 50 : Math.round((votes / total) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Swords className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-xl">Loading Battle Rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pb-24">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-red-900/30 via-black to-orange-900/30 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Swords className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Battle Rooms
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Epic video showdowns - Vote for your favorite and win prizes!
          </p>
          <div className="flex gap-4 flex-wrap">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
              <Flame className="w-3 h-3 mr-1" />
              {battles.filter(b => b.status === "active").length} Live Battles
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <Trophy className="w-3 h-3 mr-1" />
              ${battles.reduce((sum, b) => sum + b.prizePool, 0).toFixed(2)} Prize Pool
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Users className="w-3 h-3 mr-1" />
              {battles.reduce((sum, b) => sum + getTotalVotes(b), 0)} Total Votes
            </Badge>
          </div>
          <Button 
            onClick={() => createBattleMutation.mutate()}
            disabled={createBattleMutation.isPending}
            className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white"
            data-testid="button-create-battle"
          >
            <Zap className="w-4 h-4 mr-2" />
            {createBattleMutation.isPending ? "Creating..." : "Create Battle"}
          </Button>
        </div>
      </div>

      {/* Active Battles */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 text-orange-400">Active Battles</h2>
        
        {battles.filter(b => b.status === "active").length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No active battles right now</p>
              <Button 
                onClick={() => createBattleMutation.mutate()}
                className="bg-gradient-to-r from-orange-600 to-red-600"
                data-testid="button-create-first-battle"
              >
                Create the First Battle!
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {battles.filter(b => b.status === "active").map((battle) => {
              const totalVotes = getTotalVotes(battle);
              const creator1Pct = getVotePercentage(battle.creator1Votes, totalVotes);
              const creator2Pct = getVotePercentage(battle.creator2Votes, totalVotes);
              const winner = battle.creator1Votes > battle.creator2Votes ? 1 : 
                            battle.creator2Votes > battle.creator1Votes ? 2 : null;

              return (
                <Card 
                  key={battle.id}
                  className="bg-white/5 border-white/10 hover:border-orange-500/50 transition-all"
                  data-testid={`card-battle-${battle.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                        {battle.category}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        <Trophy className="w-3 h-3 mr-1" />
                        ${battle.prizePool}
                      </Badge>
                    </div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Swords className="w-5 h-5 text-orange-500" />
                      Battle #{battle.id}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {totalVotes} votes • Ends {new Date(battle.endsAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Creator 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={battle.creator1Avatar} 
                            alt={battle.creator1Username}
                            className="w-12 h-12 rounded-full border-2 border-cyan-500"
                          />
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                              {battle.creator1Username}
                              {winner === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                            </p>
                            <p className="text-sm text-gray-400">{battle.creator1Votes} votes</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleVote(battle.id, 1)}
                          disabled={voteMutation.isPending}
                          variant="outline"
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                          data-testid={`button-vote-creator1-${battle.id}`}
                        >
                          Vote
                        </Button>
                      </div>
                      <Progress value={creator1Pct} className="h-2 bg-white/10" />
                      <p className="text-right text-sm text-cyan-400 font-semibold">{creator1Pct}%</p>
                    </div>

                    <div className="text-center py-2">
                      <Swords className="w-6 h-6 text-orange-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">VS</p>
                    </div>

                    {/* Creator 2 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={battle.creator2Avatar} 
                            alt={battle.creator2Username}
                            className="w-12 h-12 rounded-full border-2 border-purple-500"
                          />
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                              {battle.creator2Username}
                              {winner === 2 && <Crown className="w-4 h-4 text-yellow-500" />}
                            </p>
                            <p className="text-sm text-gray-400">{battle.creator2Votes} votes</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleVote(battle.id, 2)}
                          disabled={voteMutation.isPending}
                          variant="outline"
                          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                          data-testid={`button-vote-creator2-${battle.id}`}
                        >
                          Vote
                        </Button>
                      </div>
                      <Progress value={creator2Pct} className="h-2 bg-white/10" />
                      <p className="text-right text-sm text-purple-400 font-semibold">{creator2Pct}%</p>
                    </div>

                    <Button 
                      onClick={() => setSelectedBattle(battle)}
                      variant="outline"
                      className="w-full border-white/20 hover:bg-white/5"
                      data-testid={`button-watch-battle-${battle.id}`}
                    >
                      Watch Battle Videos
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Battles */}
      {battles.filter(b => b.status === "ended").length > 0 && (
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-400">Past Battles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {battles.filter(b => b.status === "ended").slice(0, 6).map((battle) => {
              const winner = battle.creator1Votes > battle.creator2Votes ? 
                { name: battle.creator1Username, avatar: battle.creator1Avatar, votes: battle.creator1Votes } : 
                { name: battle.creator2Username, avatar: battle.creator2Avatar, votes: battle.creator2Votes };

              return (
                <Card 
                  key={battle.id}
                  className="bg-white/5 border-white/10"
                  data-testid={`card-past-battle-${battle.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                        Ended
                      </Badge>
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={winner.avatar} 
                        alt={winner.name}
                        className="w-12 h-12 rounded-full border-2 border-yellow-500"
                      />
                      <div>
                        <p className="font-semibold text-white flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          {winner.name}
                        </p>
                        <p className="text-sm text-gray-400">{winner.votes} votes</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Battle #{battle.id} • {battle.category}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
