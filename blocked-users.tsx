import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserX, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function BlockedUsers() {
  const { toast } = useToast();

  const { data: blockedUserIds = [], isLoading } = useQuery<string[]>({
    queryKey: ["/api/users/blocked"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: blockedUserIds.length > 0,
  });

  const blockedUsers = users.filter((user) => blockedUserIds.includes(user.id));

  const unblockMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/users/${userId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/blocked"] });
      toast({
        title: "User unblocked",
        description: "This user has been unblocked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-6 h-6 text-destructive" />
            Blocked Users
          </CardTitle>
          <CardDescription>
            Manage users you've blocked. Blocked users can't see your content, send you messages, or interact with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No blocked users</h3>
              <p className="text-slate-400">You haven't blocked anyone yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div
                    key={user.id}
                    data-testid={`blocked-user-${user.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border hover-elevate"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-purple-600 text-white">
                          {user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold" data-testid={`text-username-${user.id}`}>
                          {user.username || "Unknown User"}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unblockMutation.mutate(user.id)}
                      disabled={unblockMutation.isPending}
                      data-testid={`button-unblock-${user.id}`}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
