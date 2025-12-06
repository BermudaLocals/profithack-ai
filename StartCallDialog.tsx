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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Video, Phone, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface StartCallDialogProps {
  callType: "video" | "audio";
  trigger?: React.ReactNode;
}

export function StartCallDialog({ callType, trigger }: StartCallDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search for users
  const { data: searchResults = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      try {
        return await apiRequest(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, "GET");
      } catch (error) {
        return [];
      }
    },
    enabled: searchQuery.length >= 2,
  });

  const startCallMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) {
        throw new Error("Please select a user to call");
      }

      return await apiRequest("/api/calls/initiate", "POST", {
        type: callType,
        recipientId: selectedUser.id,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls/history"] });
      toast({
        title: "Call Started",
        description: `${callType === "video" ? "Video" : "Voice"} call initiated with ${selectedUser?.firstName || selectedUser?.email}`,
      });
      setOpen(false);
      resetForm();
      
      // TODO: Navigate to call interface
      // For now, just show success message
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start call",
      });
    },
  });

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUser(null);
  };

  const Icon = callType === "video" ? Video : Phone;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Start {callType === "video" ? "Video" : "Voice"} Call
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Search for a user to call
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected User */}
          {selectedUser && (
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Calling:</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-purple-600 text-white">
                    {selectedUser.firstName?.[0] || selectedUser.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {selectedUser.firstName || selectedUser.email}
                  </p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {/* User Search */}
          {!selectedUser && (
            <div className="space-y-2">
              <Label htmlFor="user-search" className="text-white">
                Search Users
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="user-search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-call-user-search"
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ScrollArea className="h-64 rounded-md border border-slate-700 bg-slate-800">
                  <div className="p-2">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        data-testid={`call-user-result-${user.id}`}
                        className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-600 text-white">
                            {user.firstName?.[0] || user.email[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">
                            {user.firstName || user.email}
                          </p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <Icon className="w-5 h-5 text-purple-400" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  No users found
                </p>
              )}
              
              {searchQuery.length < 2 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            data-testid="button-cancel-call"
          >
            Cancel
          </Button>
          <Button
            onClick={() => startCallMutation.mutate()}
            disabled={!selectedUser || startCallMutation.isPending}
            data-testid="button-initiate-call"
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            {startCallMutation.isPending ? "Starting..." : (
              <>
                <Icon className="w-4 h-4 mr-2" />
                Call Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
