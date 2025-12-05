import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Swords, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  displayName: string;
}

export function SendBattleChallenge() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [battleType, setBattleType] = useState<"solo" | "teams">("solo");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const sendChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected");
      
      return apiRequest("POST", "/api/battles/challenge/send", {
        challengedId: selectedUser.id,
        title,
        message,
        battleType,
        teamCount: battleType === "solo" ? 2 : 2,
        teamSize: battleType === "solo" ? 1 : 2,
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge sent!",
        description: `Battle challenge sent to @${selectedUser?.username}`,
      });
      setOpen(false);
      setSelectedUser(null);
      setTitle("");
      setMessage("");
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["/api/battles"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-send-challenge" className="gap-2">
          <Swords className="w-4 h-4" />
          Challenge User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Battle Challenge</DialogTitle>
          <DialogDescription>
            Challenge another user to a 1v1 battle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedUser ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="input-search-user"
                  placeholder="Search users by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchQuery.length > 2 && (
                <ScrollArea className="h-48 border rounded-lg">
                  {users.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          data-testid={`button-select-user-${user.username}`}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedUser.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                </div>
                <Button
                  data-testid="button-change-user"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Battle Title</label>
                <Input
                  data-testid="input-battle-title"
                  placeholder="e.g., Dance Battle 🔥"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Battle Type</label>
                <Select value={battleType} onValueChange={(v: any) => setBattleType(v)}>
                  <SelectTrigger data-testid="select-battle-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">1v1 Solo Battle</SelectItem>
                    <SelectItem value="teams">2v2 Team Battle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message (Optional)</label>
                <Textarea
                  data-testid="input-challenge-message"
                  placeholder="Let's see what you got! 💪"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                data-testid="button-confirm-challenge"
                className="w-full gap-2"
                onClick={() => sendChallengeMutation.mutate()}
                disabled={!title || sendChallengeMutation.isPending}
              >
                <Swords className="w-4 h-4" />
                {sendChallengeMutation.isPending ? "Sending..." : "Send Challenge"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
