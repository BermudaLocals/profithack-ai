import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Pause, Trash2, Plus, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MarketingBot = {
  id: string;
  name: string;
  type: string;
  status: string;
  totalActions: number;
  successfulActions: number;
  totalEarnings: number;
  schedule: string;
  lastRun: string | null;
  createdAt: string;
};

export default function BotsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBot, setNewBot] = useState({
    name: "",
    type: "content_creator",
    schedule: "daily",
    config: {
      topics: ["tech", "gaming"],
      contentType: "short",
      ageRating: "u16",
    },
  });

  const { data: bots = [] } = useQuery<MarketingBot[]>({
    queryKey: ["/api/marketing/bots"],
  });

  const createBotMutation = useMutation({
    mutationFn: async (botData: any) => {
      const response = await apiRequest("/api/marketing/bots", "POST", botData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/bots"] });
      toast({ title: "Bot created!", description: "Your marketing bot is now active" });
      setIsCreateOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest(`/api/marketing/bots/${id}/status`, "PATCH", { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/bots"] });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/marketing/bots/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/bots"] });
      toast({ title: "Bot deleted" });
    },
  });

  const handleCreate = () => {
    createBotMutation.mutate(newBot);
  };

  const totalEarnings = bots.reduce((sum, bot) => sum + bot.totalEarnings, 0);
  const totalActions = bots.reduce((sum, bot) => sum + bot.totalActions, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Bots</h1>
          <p className="text-muted-foreground">AI agents working 24/7</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Marketing Bot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bot Name</Label>
                <Input
                  value={newBot.name}
                  onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  placeholder="My Content Bot"
                />
              </div>
              <div>
                <Label>Bot Type</Label>
                <Select value={newBot.type} onValueChange={(type) => setNewBot({ ...newBot, type })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content_creator">Content Creator</SelectItem>
                    <SelectItem value="engagement">Engagement Bot</SelectItem>
                    <SelectItem value="ai_influencer">AI Influencer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Schedule</Label>
                <Select value={newBot.schedule} onValueChange={(schedule) => setNewBot({ ...newBot, schedule })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newBot.name}>
                Create Bot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.filter(b => b.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">of {bots.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground">automated tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarnings} credits</div>
            <p className="text-xs text-muted-foreground">${(totalEarnings * 0.024).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                  {bot.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{bot.type.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Schedule:</span>
                  <span className="capitalize">{bot.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actions:</span>
                  <span>{bot.totalActions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Earnings:</span>
                  <span>{bot.totalEarnings} credits</span>
                </div>
              </div>

              <div className="flex gap-2">
                {bot.status === "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({ id: bot.id, status: "paused" })}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: bot.id, status: "active" })}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteBotMutation.mutate(bot.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bots.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No bots yet</h3>
            <p className="text-muted-foreground mb-4">Create your first marketing bot to automate content</p>
          </div>
        </Card>
      )}
    </div>
  );
}
