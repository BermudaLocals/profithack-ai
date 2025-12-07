import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Users, Video, Zap, Crown, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SendBattleChallenge } from "@/components/send-battle-challenge";
import { BattleChallengesList } from "@/components/battle-challenges-list";

const battleSchema = z.object({
  title: z.string().min(1, "Title required"),
  battleType: z.enum(["solo", "teams"]),
  teamCount: z.number().min(2).max(20),
  teamSize: z.number().min(1).max(10),
});

type BattleFormData = z.infer<typeof battleSchema>;

export default function BattlesPage() {
  const [selectedType, setSelectedType] = useState<"solo" | "teams">("solo");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BattleFormData>({
    resolver: zodResolver(battleSchema),
    defaultValues: {
      title: "",
      battleType: "solo",
      teamCount: 2,
      teamSize: 1,
    },
  });

  const createBattleMutation = useMutation({
    mutationFn: async (data: BattleFormData) => {
      return apiRequest("POST", "/api/battles/create", {
        title: data.title,
        roomType: "battle",
        teamCount: data.battleType === "teams" ? data.teamCount : 0,
        teamSize: data.battleType === "teams" ? data.teamSize : 1,
        maxParticipants: data.battleType === "teams" ? data.teamCount * data.teamSize : data.teamCount,
      });
    },
    onSuccess: () => {
      toast({ title: "⚔️ Battle created!", description: "Share with friends to start!" });
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create battle", variant: "destructive" });
    },
  });

  const { data: activeBattles = [] } = useQuery<any[]>({
    queryKey: ["/api/battles/active"],
  });

  const quickPresets = [
    { name: "1v1 Duel", teams: 2, size: 1, total: 2, icon: "⚔️", color: "from-red-500 to-orange-500" },
    { name: "2v2 Squad", teams: 2, size: 2, total: 4, icon: "🛡️", color: "from-blue-500 to-cyan-500" },
    { name: "5-Way Battle", teams: 5, size: 1, total: 5, icon: "⭐", color: "from-purple-500 to-pink-500" },
    { name: "4v4 Team War", teams: 2, size: 4, total: 8, icon: "🔥", color: "from-orange-500 to-red-500" },
    { name: "10v10 Mega Battle", teams: 2, size: 10, total: 20, icon: "💥", color: "from-yellow-500 to-orange-500" },
    { name: "3v3v3 Triple Threat", teams: 3, size: 3, total: 9, icon: "⚡", color: "from-green-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* TikTok-Style Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Swords className="w-8 h-8 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Battle Rooms
                </h1>
                <p className="text-xs text-muted-foreground">Epic live battles • Up to 20 players</p>
              </div>
            </div>
            <SendBattleChallenge />
          </div>
        </div>
      </div>

      {/* Main Content - Mobile-First Scrollable */}
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        
        {/* Quick Battle Presets - Horizontal Scroll (TikTok Style) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            ⚡ Quick Start
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
            {quickPresets.map((config) => (
              <button
                key={config.name}
                data-testid={`preset-${config.name.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => {
                  form.setValue("title", config.name);
                  form.setValue("battleType", config.size === 1 && config.teams > 2 ? "solo" : "teams");
                  form.setValue("teamCount", config.teams);
                  form.setValue("teamSize", config.size);
                  setSelectedType(config.size === 1 && config.teams > 2 ? "solo" : "teams");
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                className="flex-shrink-0 snap-center w-32 h-40 rounded-2xl bg-gradient-to-br p-[2px] hover-elevate active-elevate-2 transition-transform"
                style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
              >
                <div className={`w-full h-full rounded-2xl bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3`}>
                  <div className="text-4xl">{config.icon}</div>
                  <div className="text-xs font-bold text-center leading-tight">{config.name}</div>
                  <div className="text-[10px] text-muted-foreground">{config.total} players</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create Battle Form - Card Style */}
        <div className="rounded-3xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/50 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Battle</h2>
              <p className="text-sm text-muted-foreground">Set up your epic showdown</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createBattleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Battle Title</FormLabel>
                    <FormControl>
                      <Input 
                        data-testid="input-battle-title" 
                        placeholder="Epic 2v2 Showdown 🔥" 
                        className="h-12 bg-background/50 border-border/50 rounded-xl"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="battleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Battle Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedType(value as "solo" | "teams");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger 
                          data-testid="select-battle-type"
                          className="h-12 bg-background/50 border-border/50 rounded-xl"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solo">⚔️ Solo Battle (Free-for-all)</SelectItem>
                        <SelectItem value="teams">🛡️ Team Battle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType === "solo" ? (
                <FormField
                  control={form.control}
                  name="teamCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Number of Participants</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            data-testid="input-participant-count"
                            type="number"
                            min={2}
                            max={20}
                            className="h-12 pl-11 bg-background/50 border-border/50 rounded-xl"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">2-20 players</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teamCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Teams</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-team-count"
                              type="number"
                              min={2}
                              max={10}
                              className="h-12 bg-background/50 border-border/50 rounded-xl text-center"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">2-10 teams</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Per Team</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-team-size"
                              type="number"
                              min={1}
                              max={10}
                              className="h-12 bg-background/50 border-border/50 rounded-xl text-center"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">1-10 each</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm font-semibold text-primary">
                      Total: {form.watch("teamCount") * form.watch("teamSize")} players
                    </p>
                  </div>
                </>
              )}

              <Button
                data-testid="button-create-battle"
                type="submit"
                className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                disabled={createBattleMutation.isPending}
              >
                {createBattleMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Create Battle Room
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Active Battles - TikTok-Style Feed */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            🔥 Live Battles
          </h3>
          
          {!activeBattles || activeBattles.length === 0 ? (
            <div className="rounded-3xl bg-card/30 backdrop-blur-sm border border-border/30 p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No active battles</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBattles.map((battle: any) => (
                <div
                  key={battle.id}
                  data-testid={`battle-${battle.id}`}
                  className="rounded-2xl bg-gradient-to-br from-card/70 to-card/40 backdrop-blur-sm border border-border/40 p-4 hover-elevate active-elevate-2 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
                        <Video className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{battle.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {battle.teamCount > 0
                            ? `${battle.teamCount} teams × ${battle.teamSize} players`
                            : `${battle.maxParticipants}-way battle`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      data-testid={`button-join-${battle.id}`} 
                      size="sm"
                      className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 font-semibold"
                      onClick={() => {
                        navigate(`/battle/${battle.id}`);
                      }}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Battle Challenges */}
        <BattleChallengesList />
      </div>
    </div>
  );
}
