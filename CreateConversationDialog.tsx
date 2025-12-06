import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Plus, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface CreateConversationDialogProps {
  trigger?: React.ReactNode;
}

export function CreateConversationDialog({ trigger }: CreateConversationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [conversationName, setConversationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Search for users
  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, "GET");
      return await response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      if (selectedUsers.length === 0) {
        throw new Error("Please select at least one user");
      }

      return await apiRequest("/api/conversations", "POST", {
        name: isGroup ? conversationName || "New Group" : undefined,
        isGroup,
        memberIds: selectedUsers.map(u => u.id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Success",
        description: `${isGroup ? "Group" : "Conversation"} created successfully!`,
      });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create conversation",
      });
    },
  });

  const resetForm = () => {
    setIsGroup(false);
    setConversationName("");
    setSearchQuery("");
    setSelectedUsers([]);
  };

  const addUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery("");
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" data-testid="button-new-conversation">
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">New Conversation</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isGroup ? "Create a group chat" : "Start a conversation"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="group-mode" className="text-white">Group Chat</Label>
            <Switch
              id="group-mode"
              checked={isGroup}
              onCheckedChange={setIsGroup}
              data-testid="switch-group-mode"
            />
          </div>

          {/* Group Name (only for groups) */}
          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-white">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                data-testid="input-group-name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">
                Selected ({selectedUsers.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="pl-2 pr-1 py-1"
                    data-testid={`selected-user-${user.id}`}
                  >
                    {user.firstName || user.email}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => removeUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="user-search" className="text-white">
              {isGroup ? "Add Members" : "Select User"}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="user-search"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-user-search"
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <ScrollArea className="h-48 rounded-md border border-slate-700 bg-slate-800">
                <div className="p-2">
                  {searchResults.map(user => {
                    const isSelected = selectedUsers.find(u => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => addUser(user)}
                        disabled={!!isSelected}
                        data-testid={`user-result-${user.id}`}
                        className={`w-full flex items-center gap-3 p-2 rounded-md hover-elevate transition-colors ${
                          isSelected ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {user.firstName?.[0] || user.email[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">
                            {user.firstName || user.email}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                        {isSelected && (
                          <Badge variant="outline" className="text-xs">Added</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No users found
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={() => createConversationMutation.mutate()}
            disabled={selectedUsers.length === 0 || createConversationMutation.isPending}
            data-testid="button-create-conversation"
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            {createConversationMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
