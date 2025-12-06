import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ban, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockButtonProps {
  userId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function BlockButton({ userId, variant = "ghost", size = "sm", showText = true }: BlockButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockStatus } = useQuery<{ isBlocked: boolean }>({
    queryKey: ["/api/users", userId, "is-blocked"],
  });

  const isBlocked = blockStatus?.isBlocked || false;

  const blockMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/users/${userId}/block`, { reason: "User blocked" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "is-blocked"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/blocked"] });
      toast({
        title: "User blocked",
        description: "This user has been blocked successfully",
      });
      setShowDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/users/${userId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "is-blocked"] });
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

  if (isBlocked) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => unblockMutation.mutate()}
        disabled={unblockMutation.isPending}
        data-testid={`button-unblock-${userId}`}
      >
        <UserX className="h-4 w-4" />
        {showText && <span className="ml-2">Unblock</span>}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        data-testid={`button-block-${userId}`}
      >
        <Ban className="h-4 w-4" />
        {showText && <span className="ml-2">Block</span>}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="dialog-block-confirm">
          <DialogHeader>
            <DialogTitle>Block User?</DialogTitle>
            <DialogDescription>
              Blocked users can't see your content, send you messages, or interact with you. They won't be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-testid="button-cancel-block"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => blockMutation.mutate()}
              disabled={blockMutation.isPending}
              data-testid="button-confirm-block"
            >
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
